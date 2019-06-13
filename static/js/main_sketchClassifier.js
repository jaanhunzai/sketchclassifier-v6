/**
 * function allows you to load metric map in the panel
 * @param element
 */
var MMGeoJsonData;
var SMGeoJsonData;
var MMStreetIDs = [];
var MMisRoute = [];
var MMLandmarksIDs = [];
var MMRegionsIDs = [];
var sm_map;
var drawnItems_sm;
var drawnItems2_sm;
var drawnItems;
var labelLayer = null;
var labelLayer_sm = null;
var sketchFileName;
var metricFileName;
//var map;
var deleteVar = 0;
var ArrowsArray = [];
var ArrowsArray_sm = [];

function HideMap() {
    $("#hideMap").hide();
    $("#metricmapplaceholder").hide();
    $("#showMap").show();
    $("#MMLinks").hide();
}

function ShowMap() {
    $("#hideMap").show();
    $("#metricmapplaceholder").show();
    $("#showMap").hide();
    $("#MMLinks").show();
}

    function loadMetricMap(element) {
    //var location = document.getElementById("metricmapplaceholder");
    var fileList = document.getElementById('MetrichMapInputbutton').files;
        console.log(fileList);
        //$("metricmapplaceholder").empty();
        for (var i = 0; i < fileList.length; i++) {
            randerLoadedFile(fileList[i], location);
        }
    }

    function randerLoadedFile(file, location){
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

            map = new L.map('metricmapplaceholder', {
                crs: L.CRS.Simple
            });

            map.options.doubleClickZoom = false;

            var bounds = [[0, 0], [580, 900]];
            var MMLoaded = new L.imageOverlay(image.src, bounds);
                MMLoaded.addTo(map);
                map.fitBounds(bounds);

            metricFileName = image.title;

            //metricFileName = fileName_full.split(".");

            //metricFileName = fName[0];
            //$('#span_mm').html(metricFileName);


         /*   $.ajax({
                url: '/metricFileName',
                data: {metricFileName: metricFileName},
                success: function (resp) {
                }
            });*/
            loadEditingToolforMM(map);
            //$("#hideMap").show();


            // $("#qualify_MM").prop("disabled", false);
        }

    }


function loadMetricMap_old(element) {
    // test if metric map is already loaded or not
    if (document.getElementById('metricmapplaceholder').innerHTML === "") {
        var fileInput;
        var reader = new FileReader();
        fileInput = document.getElementById('MetrichMapInputbutton').files;
        var file = fileInput.files[0];
        reader.readAsDataURL(file);

        reader.onload = function (e) {

            var container = L.DomUtil.get('map');
            if (container != null) {
                container._leaflet_id = null;
            }
            var image = new Image();
            image.title = file.name;
            image.src = this.result;
            document.getElementById('mm').src = image.src;

            map = new L.map('metricmapplaceholder', {
                crs: L.CRS.Simple
            });

            map.options.doubleClickZoom = false;

            var bounds = [[0, 0], [580, 900]];
            var MMLoaded = new L.imageOverlay(image.src, bounds);
            MMLoaded.addTo(map);
            map.fitBounds(bounds);
            var fileName_full = image.title;

            fName = fileName_full.split(".");

            metricFileName = fName[0];
            $('#span_mm').html(metricFileName);
            $.ajax({
                url: '/metricFileName',
                data: {metricFileName: metricFileName},
                success: function (resp) {
                }
            });
            loadEditingToolforMM(map);
            $("#hideMap").show();


            // $("#qualify_MM").prop("disabled", false);
        }
        // if metric map is already loaded delete old one and add new metric map
    } else {
        document.getElementById('metricmapplaceholder').innerHTML = "" +
            "<div id='map' align='Center' style='width:relative; height:600px; border: none; margin-left: 05px;'></div>";

        var fileInput;
        var reader = new FileReader();
        fileInput = document.getElementById('MetrichMapInputbutton').files;
        var file = fileInput.files[0];
        reader.readAsDataURL(file);

        reader.onload = function (e) {
            var container = L.DomUtil.get('map');
            if (container != null) {
                container._leaflet_id = null;
            }
            var image = new Image();
            image.title = file.name;
            image.src = this.result;
            document.getElementById('mm').src = image.src;

            map = new L.map('map', {
                crs: L.CRS.Simple
            });

            var bounds = [[0, 0], [580, 900]];
            var MMLoaded = new L.imageOverlay(image.src, bounds);
            MMLoaded.addTo(map);
            map.fitBounds(bounds);
            var fileName_full = image.title;

            fName = fileName_full.split(".");

            metricFileName = fName[0];
            $('#span_mm').html(metricFileName);
            //console.log("is comming here...",metricFileName);
            loadEditingToolforMM(map);
            $("#hideMap").show();

            $.ajax({
                url: '/metricFileName',
                data: {metricFileName: metricFileName},
                success: function (resp) {
                }
            });
            // $("#qualify_MM").prop("disabled", false);
        };
    }
};

function uploadJsonMM() {
    var fileList = document.getElementById('importMetricFeatures').files;
    for (var i = 0; i < fileList.length; i++) {
        randerGeoJsonFilesMM(fileList[i], map);
    }
}

function randerGeoJsonFilesMM(file, map) {
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
            map.fitBounds(loadedJsonLayer.getBounds());
            loadJsonLayer_mm(map);
        });
    }
}

function loadJsonLayer_mm(map) {
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
            }).addTo(map);

            // push LayerGroup for arrows and layers in Array
            var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);
            var Linie = [arrowsLayerGroup, layer, arrowHead]
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
            }).addTo(map);

            // push LayerGroup for arrows and layers in Array
            var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);
            var Linie = [arrowsLayerGroup, layer, arrowHead]
            ArrowsArray.push(Linie);

            layer.options.color = 'red';
            addStreetPopupMM(layer);
        }
    })

    map.addLayer(drawnItems);

}

/**
 * adding toolbar in the map
 * using leaflet plugin "leaflet.pm"
 * @param map
 * @returns
 */
var arrowHead;

function loadEditingToolforMM(map) {

    drawnItems = new L.FeatureGroup();

    map.addLayer(drawnItems);

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
    map.pm.addControls(options);

    /**
     * now how drawing works
     * using again leaflet plugin "leaflet.pm"
     */
    map.on('pm:create', function (event) {
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
            }).addTo(map);
            var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);
            var Linie = [arrowsLayerGroup, layer, arrowHead]
            ArrowsArray.push(Linie);
        }
        if (type === "Poly") {
            addLandmarkPopupMM(layer);
            layer.openPopup();
        }
    });

    map.on('pm:remove', function (event) {
        var deleteButton = document.getElementsByClassName('leaflet-pm-icon-delete');
        var buttoncontrol = deleteButton[0].parentElement;

        // delete line and arrows from map
        if (buttoncontrol.classList.contains('active')) {
            loop1:
                for (var i = 0; i < ArrowsArray.length; i++) {
                    for (var j = 0; j < ArrowsArray[i].length; j++) {
                        if (event.layer._leaflet_id == ArrowsArray[i][j]._leaflet_id) {
                            if (j == 1) {
                                map.removeLayer(ArrowsArray[i][j + 1]);
                                ArrowsArray.splice(i, 1);
                                break loop1;

                            } else if (j == 2) {
                                map.removeLayer(ArrowsArray[i][j - 1])
                                break loop1;
                            }
                        }
                    }
                }
        }

        layerid = event.layer._leaflet_id;
        deleteFunction();
    })

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
        })
    }
}


/**
 * the function create popUp that contains box for ID
 * and checkbox for being a segment as route part
 */
function addStreetPopupMM(layer) {
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
    RouteType = layer.feature.properties.isRoute;
    if (RouteType == "Yes") {
        isRoute.checked = true;
    }

    popupContent.append(featurIdLabel);
    popupContent.append(featurId);
    popupContent.append(labelRoute);
    popupContent.append(isRoute);
    layer.bindPopup(popupContent);

    var popup = layer.getPopup();
    popup.options.maxHeight = 250;
    popup.options.maxWidth = 350;

    // handling of the checkbox for the "RouteSegment" statetment
    var popupStreets;
    isRoute.addEventListener("click", clickedFunction, false);

    function clickedFunction() {
        if (isRoute.checked == true) {
            isRoute.setAttribute("value", "Yes");
            layer.feature.properties.isRoute = isRoute.value;
            changeColor(layer);
        } else if (isRoute.checked == false) {
            isRoute.setAttribute("value", null);
            layer.feature.properties.isRoute = isRoute.value;
            changeColorBack(layer);
        }
    }

    layer.on("popupopen", function () {
        featurId.value = layer.feature.properties.id;
        isRoute.value = layer.feature.properties.isRoute;
        featurId.focus();
    });


    var closedLayer;
    layer.on("popupclose", function () {
        if (featurId.value == '') {
            alert("ERROR! Do not forget to give the street a name!");
        } else {
            layer.feature.properties.id = featurId.value;
            layer.feature.properties.FID = featurId.value;
            layer.feature.properties.name = featurId.value;

            if (deleteVar == 0) {
                /**
                 *  if id from object is already in Streets array
                 *  but is labelled as Route
                 *  than delete id from Streets array and add it to Route array
                 */
                if (MMStreetIDs.includes(layer.feature.properties.id)) {
                    if (isRoute.value == "Yes") {
                        for (i = 0; i < MMStreetIDs.length; i++) {
                            if (MMStreetIDs[i] == layer.feature.properties.id) {
                                MMStreetIDs.splice(i, 1);
                                MMisRoute.push(layer.feature.properties.id);
                            }
                        }
                    }
                    /**
                     *  if id from object is already in Route array
                     *  but is note labelled as Route anymore
                     *  than delete id from Routes array and add it to Streets array
                     */
                } else if (MMisRoute.includes(layer.feature.properties.id)) {
                    if (isRoute.value == "Yes") {
                    } else {
                        for (i = 0; i < MMisRoute.length; i++) {
                            if (MMisRoute[i] == layer.feature.properties.id) {
                                MMisRoute.splice(i, 1);
                                MMStreetIDs.push(layer.feature.properties.id);
                            }
                        }
                    }
                    /**
                     *  if id from object is neither in Streets nor in Route array
                     *  than add it to the corresponding array
                     */
                } else {
                    if (layer.feature.properties.isRoute == "Yes") {
                        MMisRoute.push(layer.feature.properties.id);
                        arrowHead.options.patterns[0].symbol.options.pathOptions.color = "red";
                    } else {
                        MMStreetIDs.push(layer.feature.properties.id);
                    }
                }
            } else {
                deleteVar = 0;
            }
        }

    })
}

//##############################################################
/**
 * If the isRoute checkbox is checked, the color of the line should change to red
 */
function changeColor(layer) {

    drawnItems.eachLayer(function (l) {
        if (l == layer) {
            loop1:
                for (var i = 0; i < ArrowsArray.length; i++) {
                    for (var j = 0; j < ArrowsArray[i].length; j++) {
                        if (l._leaflet_id == ArrowsArray[i][j]._leaflet_id) {
                            if (j == 1) {
                                map.removeLayer(ArrowsArray[i][j + 1]);
                                map.removeLayer(l);
                                ArrowsArray.splice(i, 1);
                                break loop1;
                            } else if (j == 2) {
                                map.removeLayer(l)
                                map.removeLayer(ArrowsArray[i][j]);
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
                    if (layers == layer) {
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
                        }).addTo(map);
                        var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);
                        var Linie = [arrowsLayerGroup, layer, arrowHead]
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
                                map.removeLayer(ArrowsArray[i][j + 1]);
                                map.removeLayer(l);
                                ArrowsArray.splice(i, 1);
                                break loop1;
                            } else if (j == 2) {
                                map.removeLayer(l)
                                map.removeLayer(ArrowsArray[i][j]);
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
                        }).addTo(map);
                        var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);
                        var Linie = [arrowsLayerGroup, layer, arrowHead]
                        ArrowsArray.push(Linie);

                        addStreetPopupMM(layers);
                    }
                })
            }

            x(y);
        }
    });
}

//###################################################

function addLandmarkPopupMM(layer) {
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
    featureType = layer.feature.properties.feat_type;
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

    layer.bindPopup(popupContent);

    // handling of the checkbox for the "Landmark" statetment
    isLandmark.addEventListener("click", clickedFunction1, false);

    function clickedFunction1() {
        if (isLandmark.checked == true) {
            isLandmark.setAttribute("value", "Landmark");
            layer.feature.properties.feat_type = isLandmark.value;
            isCityblock.checked = false;
        } else if (isLandmark.checked == false) {
            isCityblock.checked = true;
            isCityblock.setAttribute("value", "Cityblock");
            layer.feature.properties.feat_type = isCityblock.value;
        }
    }

    // handling of the checkbox for the "Region" statetment
    isCityblock.addEventListener("click", clickedFunction2, false);

    function clickedFunction2() {
        if (isCityblock.checked == true) {
            isCityblock.setAttribute("value", "Cityblock");
            layer.feature.properties.feat_type = isCityblock.value;
            isLandmark.checked = false;
        } else if (isCityblock.checked == false) {
            isLandmark.checked = true;
            isLandmark.setAttribute("value", "Landmark");
            layer.feature.properties.feat_type = isCityblock.value;
        }
    }

    layer.on("popupopen", function () {
        featurId.value = layer.feature.properties.id;
        isCityblock.value = layer.feature.properties.feat_type;
        featurId.focus();
    });

    layer.on("popupclose", function () {
        if (featurId.value == '') {
            alert("ERROR! Do not forget to give the landmark/ region a name!");
        } else {
            layer.feature.properties.id = featurId.value;
            layer.feature.properties.FID = featurId.value;
            layer.feature.properties.name = featurId.value;

            if (MMLandmarksIDs.includes(layer.feature.properties.id)) {
                if (layer.feature.properties.feat_type == "Cityblock") {
                    for (i = 0; i < MMLandmarksIDs.length; i++) {
                        if (MMLandmarksIDs[i] == layer.feature.properties.id) {
                            MMLandmarksIDs.splice(i, 1);
                            MMRegionsIDs.push(layer.feature.properties.id);
                        }
                    }

                } else {
                }
            } else if (MMRegionsIDs.includes(layer.feature.properties.id)) {
                if (layer.feature.properties.feat_type == "Landmark") {
                    for (i = 0; i < MMRegionsIDs.length; i++) {
                        if (MMRegionsIDs[i] == layer.feature.properties.id) {
                            MMRegionsIDs.splice(i, 1);
                            MMLandmarksIDs.push(layer.feature.properties.id);
                        }
                    }
                }
            } else {
                if (layer.feature.properties.feat_type == "Landmark") {
                    MMLandmarksIDs.push(layer.feature.properties.id);
                } else if (layer.feature.properties.feat_type == "Cityblock") {
                    MMRegionsIDs.push(layer.feature.properties.id);
                }
            }
        }
    });
}

function downloadJsonMM() {
    MMGeoJsonData = drawnItems.toGeoJSON();
    // Stringify the GeoJson
    var mmGeojson = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(MMGeoJsonData));
    // Create export
    document.getElementById('exportMetricFeatures').setAttribute('href', 'data:' + mmGeojson);
    document.getElementById('exportMetricFeatures').setAttribute('download', 'MM_fileName.geojson');
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
    labelLayer.addTo(map);
    document.getElementById("showLabels").disabled = true;

}

function hideLabels() {
    document.getElementById("hideLabels").checked = true;
    document.getElementById("showLabels").checked = false;
    map.removeLayer(labelLayer);
    document.getElementById("showLabels").disabled = false;
}


/**
 * function allows you to load Sketch map in the panel
 * @param element
 */
function loadSketchMap(element) {
    // test if sketch map is already loaded or not
    if (document.getElementById('sketchmapplaceholder').innerHTML === "") {
        var fileInput;
        var reader = new FileReader();
        fileInput = document.getElementById('SketchMapInputbutton');
        var file = fileInput.files[0];
        reader.readAsDataURL(file);

        reader.onload = function (e) {
            var container = L.DomUtil.get('sm_map');
            if (container != null) {
                container._leaflet_id = null;
            }
            var image = new Image();
            image.title = file.name;
            image.src = this.result;
            document.getElementById('sm1').src = image.src;

            sm_map = new L.map('sketchmapplaceholder1', {crs: L.CRS.Simple});

            sm_map.options.doubleClickZoom = false;
            var bounds = [[0, 0], [580, 900]];
            sm_map.fitBounds(bounds);
            var MMLoaded = new L.imageOverlay(image.src, bounds);
            MMLoaded.addTo(sm_map);

            var fileName_full = image.title;
            fName = fileName_full.split(".");
            sketchFileName = fName[0];

            $('#span_sm1').html(sketchFileName);
            loadEditingToolforSM(sm_map);

            $("#SMLinks").show();
            $.ajax({
                url: '/sketchFileName',
                data: {sketchFileName: sketchFileName},
                success: function (resp) {
                }
            });

        }
        // if sketch map is already loaded, delete old SM and add new SM
    } else {
        document.getElementById('sketchmapplaceholder1').innerHTML = "<div id='sketchmap' align='Center' style='width:relative; height:600px; border: none; margin-left: 05px;'></div>";

        var fileInput;
        var reader = new FileReader();
        fileInput = document.getElementById('SketchMapInputbutton');
        var file = fileInput.files[0];
        reader.readAsDataURL(file);

        reader.onload = function (e) {
            var container = L.DomUtil.get('sm_map');
            if (container != null) {
                container._leaflet_id = null;
            }
            var image = new Image();
            image.title = file.name;
            image.src = this.result;
            document.getElementById('sm1').src = image.src;

            sm_map = new L.map('sketchmap', {crs: L.CRS.Simple});

            var bounds = [[0, 0], [580, 900]];
            sm_map.fitBounds(bounds);
            var MMLoaded = new L.imageOverlay(image.src, bounds);
            MMLoaded.addTo(sm_map);


            var fileName_full = image.title;
            fName = fileName_full.split(".");
            sketchFileName = fName[0];

            $('#span_sm1').html(sketchFileName);
            loadEditingToolforSM(sm_map);

            $("#SMLinks").show();
            $.ajax({
                url: '/sketchFileName',
                data: {sketchFileName: sketchFileName},
                success: function (resp) {
                }
            });

        }
    }
}

function uploadJsonSM() {

    var fileList = document.getElementById('importSketchFeatures').files;
    for (var i = 0; i < fileList.length; i++) {
        randerGeoJsonFiles_SM(fileList[i], sm_map);
    }
}

function randerGeoJsonFiles_SM(file, sm_map) {
    var fileName = file.name;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    //var loadedJsonLayer;
    reader.onload = function () {
        // load GeoJSON from an external file
        $.getJSON(reader.result, function (data) {
            //passing data to qualifier
            SMGeoJsonData = data;
            loadedJsonLayerSM = L.geoJson(data, {
                opacity: 0.5,
            });
            sm_map.fitBounds(loadedJsonLayerSM.getBounds());
            loadJsonLayer_sm(sm_map);
        });
    }
}

function loadJsonLayer_sm(sm_map) {
    drawnItems_sm = new L.FeatureGroup();

    loadedJsonLayerSM.eachLayer(
        function (l) {
            drawnItems_sm.addLayer(l);
        }
    );
    drawnItems_sm.eachLayer(function (layer) {
        if (layer.feature.geometry.type == "Polygon") {
            addLandmarkPopupSM(layer);
        }
        if (layer.feature.geometry.type == "LineString") {
            arrowHead = L.polylineDecorator(layer, {
                patterns: [
                    {
                        offset: 25,
                        repeat: 50,
                        endoffset: 0,
                        symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})
                    }
                ]
            }).addTo(sm_map);
            var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);

            var Linie = [arrowsLayerGroup, layer, arrowHead]
            ArrowsArray_sm.push(Linie);
            addStreetPopUpSM(layer);
        }
    })
    sm_map.addLayer(drawnItems_sm);
}

/**
 * adding toolbar in the map
 * using leaflet plugin "leaflet.pm"
 *
 */
function loadEditingToolforSM(sm_map) {

    drawnItems_sm = new L.FeatureGroup();
    drawnItems2_sm = new L.FeatureGroup();
    sm_map.addLayer(drawnItems_sm);

    var options = {
        position: 'topleft',
        drawMarker: false,
        drawPolyliine: true,
        drawRectangle: false,
        drawPolygon: true,
        drawCircle: false,
        cutPolygon: false,
        editMode: true,
        removalMode: true,
    };
    sm_map.pm.addControls(options);

    /**
     * now how drawing works
     * using again leaflet plugin "leaflet.pm"
     */
    sm_map.on('pm:create', function (event) {
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

        drawnItems_sm.addLayer(layer);
        drawnItems2_sm.addLayer(layer);
        if (type === "Line") {

            var arrowHead = L.polylineDecorator(layer, {
                patterns: [
                    {
                        offset: 25,
                        repeat: 70,
                        endoffset: 0,
                        symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})
                    }
                ]
            }).addTo(sm_map);
            var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);

            var Linie = [arrowsLayerGroup, layer, arrowHead]
            ArrowsArray_sm.push(Linie);
            addStreetPopUpSM(layer);
            layer.openPopup();

        }
        if (type === "Poly") {
            addLandmarkPopupSM(layer);
            layer.openPopup();
        }
    });


    // if drawn object get deleted remove it from geoJSON file
    sm_map.on('pm:remove', function (event) {
        var deleteButton = document.getElementsByClassName('leaflet-pm-icon-delete');
        var buttoncontrol = deleteButton[1].parentElement;

        if (buttoncontrol.classList.contains('active')) {
            loop1:
                for (var i = 0; i < ArrowsArray_sm.length; i++) {
                    for (var j = 0; j < ArrowsArray_sm[i].length; j++) {
                        if (event.layer._leaflet_id == ArrowsArray_sm[i][j]._leaflet_id) {
                            if (j == 1) {
                                sm_map.removeLayer(ArrowsArray_sm[i][j + 1]);
                                ArrowsArray_sm.splice(i, 1);
                                break loop1;
                            } else if (j == 2) {
                                sm_map.removeLayer(ArrowsArray_sm[i][j - 1])
                                break loop1;
                            }
                        }
                    }
                }
        }

        layerid = event.layer._leaflet_id;
        deleteFunction_sm();
    })

    function deleteFunction_sm() {
        drawnItems_sm.eachLayer(function (l) {
            jsonId = l._leaflet_id;
            if (layerid == jsonId) {
                drawnItems_sm.removeLayer(l);
            }
        })
    }
}

var val;
var val2;

function addStreetPopUpSM(layer, Input) {

    MMStreetIDs.sort();
    MMisRoute.sort();

    var tableDiv = document.createElement('div');
    tableDiv.setAttribute('class', 'table1')
    tableDiv.setAttribute('id', 'tableDiv');
    var table = document.createElement('table');
    table.setAttribute('id', 'popupTable')
    var row1 = table.insertRow(0);
    row1.setAttribute('id', 'Row1');
    var fetureID_div
    var fetureID_div2
    var TRoute = document.createElement('th');
    TRoute.setAttribute('id', 'TRoute');
    TRoute.innerHTML = "isRoute";
    row1.insertCell(0).append(TRoute);
    var TStreet = document.createElement('th');
    TStreet.setAttribute('id', 'TStreet');
    TStreet.innerHTML = "Streets";
    row1.insertCell(-1).append(TStreet);
    var row = table.insertRow(1);
    row.setAttribute('id', 'Row');
    var cell1 = row.insertCell(0);
    cell1.setAttribute('class', 'a');
    var cell2 = row.insertCell(-1);
    cell2.setAttribute('class', 'b');

    // If there are more Route-segments than street-segments
    if (MMisRoute.length > MMStreetIDs.length) {
        fetureID_div = document.createElement('div');
        fetureID_div.setAttribute("id", "fetureID_div");
        var checkedID1;
        fetureID_div2 = document.createElement('div');
        fetureID_div2.setAttribute("id", "fetureID_div2");
        var checkedID2;

        /**
         * Iterate over all Route-segments and add them to the
         * first column in the table
         */
        for (i = 1; i <= MMisRoute.length; i++) {
            checkedID1 = document.createElement('input');
            var label1 = document.createElement('label');

            checkedID1.setAttribute('type', 'checkbox');
            checkedID1.setAttribute('id', MMisRoute[i - 1]);
            label1.setAttribute('for', MMisRoute[i - 1]);
            label1.setAttribute('id', MMisRoute[i - 1]);
            label1.setAttribute('style', 'word-wrap:break-word');

            x = document.createTextNode(MMisRoute[i - 1]);
            label1.appendChild(x);
            var br = document.createElement('br');

            fetureID_div.appendChild(checkedID1);
            fetureID_div.appendChild(label1);
            fetureID_div.append(br);

            cell1.appendChild(fetureID_div);

            /**
             * if there are no more Street-segments do nothing
             * else add them to the second column
             */
            if (i > MMStreetIDs.length) {
                console.log("i > " + MMStreetIDs.lenght);
            } else {
                checkedID2 = document.createElement('input');
                var label2 = document.createElement('label');

                checkedID2.setAttribute('type', 'checkbox');
                checkedID2.setAttribute('id', MMStreetIDs[i - 1]);
                label2.setAttribute('for', MMStreetIDs[i - 1]);
                label2.setAttribute('id', MMStreetIDs[i - 1]);
                label2.setAttribute('style', 'word-wrap:break-word');

                x = document.createTextNode(MMStreetIDs[i - 1]);
                label2.appendChild(x);
                var br2 = document.createElement('br');

                fetureID_div2.appendChild(checkedID2);
                fetureID_div2.appendChild(label2);
                fetureID_div2.append(br2);

                cell2.appendChild(fetureID_div2);
            }
        }
        // if there are more street-segments than route segments
    } else if (MMStreetIDs.length > MMisRoute.length) {
        fetureID_div = document.createElement('div');
        fetureID_div.setAttribute("id", "fetureID_div");
        var checkedID1;
        fetureID_div2 = document.createElement('div');
        fetureID_div2.setAttribute("id", "fetureID_div2");
        var checkedID2;

        /**
         * Iterate over all street-segments and add them to the
         * second column in the table
         */
        for (var i = 1; i <= MMStreetIDs.length; i++) {

            // if there are no more route-segments, do nothing
            // else add them to the first cell
            if (i > MMisRoute.length) {
                console.log("i > " + MMisRoute.length);
            } else {
                checkedID1 = document.createElement('input');
                var label1 = document.createElement('label');

                checkedID1.setAttribute('type', 'checkbox');
                checkedID1.setAttribute('id', MMisRoute[i - 1]);
                label1.setAttribute('for', MMisRoute[i - 1]);
                label1.setAttribute('id', MMisRoute[i - 1]);
                label1.setAttribute('style', 'word-wrap:break-word');

                x = document.createTextNode(MMisRoute[i - 1]);
                label1.append(x);
                var br = document.createElement('br');

                fetureID_div.append(checkedID1);
                fetureID_div.append(label1);
                fetureID_div.append(br);
            }
            cell1.append(fetureID_div);

            checkedID2 = document.createElement('input');
            var label2 = document.createElement('label');

            checkedID2.setAttribute('type', 'checkbox');
            checkedID2.setAttribute('id', MMStreetIDs[i - 1]);
            label2.setAttribute('for', MMStreetIDs[i - 1]);
            label2.setAttribute('id', MMStreetIDs[i - 1]);
            label2.setAttribute('style', 'word-wrap:break-word');

            x = document.createTextNode(MMStreetIDs[i - 1]);
            label2.append(x);
            var br2 = document.createElement('br');

            fetureID_div2.append(checkedID2);
            fetureID_div2.append(label2);
            fetureID_div2.append(br2);


            cell2.append(fetureID_div2);
        }
        // same number of Route-segments and street-segments
    } else if (MMStreetIDs.length == MMisRoute.length) {
        fetureID_div = document.createElement('div');
        fetureID_div.setAttribute("id", "fetureID_div");
        var checkedID1;
        fetureID_div2 = document.createElement('div');
        fetureID_div2.setAttribute("id", "fetureID_div2");
        var checkedID2;

        /**
         * Iterate over all Route-segments and add them to the
         * first column in the table
         * add all street-segments to the second column in the table
         */
        for (i = 1; i <= MMisRoute.length; i++) {

            checkedID1 = document.createElement('input');
            var label1 = document.createElement('label');

            checkedID1.setAttribute('type', 'checkbox');
            checkedID1.setAttribute('id', MMisRoute[i - 1]);
            label1.setAttribute('for', MMisRoute[i - 1]);
            label1.setAttribute('id', MMisRoute[i - 1]);
            label1.setAttribute('style', 'word-wrap:break-word');

            x = document.createTextNode(MMisRoute[i - 1]);
            label1.append(x);
            var br = document.createElement('br');

            fetureID_div.append(checkedID1);
            fetureID_div.append(label1);
            fetureID_div.append(br);

            cell1.append(fetureID_div);

            checkedID2 = document.createElement('input');
            var label2 = document.createElement('label');

            checkedID2.setAttribute('type', 'checkbox');
            ;
            checkedID2.setAttribute('id', MMStreetIDs[i - 1]);
            label2.setAttribute('for', MMStreetIDs[i - 1]);
            label2.setAttribute('id', MMStreetIDs[i - 1]);
            label2.setAttribute('style', 'word-wrap:break-word');

            x = document.createTextNode(MMStreetIDs[i - 1]);
            label2.append(x);
            var br2 = document.createElement('br');

            fetureID_div2.append(checkedID2);
            fetureID_div2.append(label2);
            fetureID_div2.append(br2);

            cell2.append(fetureID_div2);
        }
    }

    tableDiv.append(table);

    layer.bindPopup(tableDiv);

    var popup = layer.getPopup();
    popup.options.maxHeight = 250;
    popup.options.maxWidth = 350;


    cell1.addEventListener("click", function (event) {
        if ($(event.target).is('[type="checkbox"]')) {
            if ($(event.target).is(":checked")) {
                val = event.target.id;
                changeColorSM(layer);
                $('input[type="checkbox"]').on('change', function () {
                    $('input[type="checkbox"]').not(this).prop('checked', false);
                });

            }
        }
    });

    cell2.addEventListener("click", function (event) {
        if ($(event.target).is('[type="checkbox"]')) {
            if ($(event.target).is(":checked")) {
                val2 = event.target.id;
                ChangeColorBackSM(layer);
                $('input[type="checkbox"]').on('change', function () {
                    $('input[type="checkbox"]').not(this).prop('checked', false);
                });

            }
        }
    });

    layer.on("popupopen", function () {
        for (i = 0; i < MMStreetIDs.length; i++) {
            id1 = MMStreetIDs[i];
            document.getElementById(id1).checked = false;
        }
        for (j = 0; j < MMisRoute.length; j++) {
            id2 = MMisRoute[j];
            document.getElementById(id2).checked = false;
        }

        var id = layer.feature.properties.id;
        val = layer.feature.properties.id;
        val2 = layer.feature.properties.id;
        if (id == null) {
        } else {
            document.getElementById(id).checked = true;
        }
    });

    /**
     if checkbox is checked then pass the value to feature id
     **/
    layer.on("popupclose", function () {
        var k = 0;
        var l = 0;
        for (var i = 0; i < MMisRoute.length; i++) {
            var Routes = document.getElementById(MMisRoute[i]);
            if (Routes.checked == true) {
                layer.feature.properties.id = val;
                layer.feature.properties.FID = val;
                layer.feature.properties.name = val;
                layer.feature.properties.isRoute = "Yes";
                k++;
            }
        }
        for (var j = 0; j < MMStreetIDs.length; j++) {
            var Streets = document.getElementById(MMStreetIDs[j]);
            if (Streets.checked == true) {
                layer.feature.properties.id = val2;
                layer.feature.properties.FID = val2;
                layer.feature.properties.name = val2;
                layer.feature.properties.isRoute = null;
                l++;
            }
        }
        if (k == 0 && l == 0) {
            alert("ERROR! Do not forget to give the Street a name!");
        }
    });
}

//##########################################
function changeColorSM(layer) {
    drawnItems2_sm.eachLayer(function (l) {
        if (l == layer) {
            loop1:
                for (var i = 0; i < ArrowsArray_sm.length; i++) {
                    for (var j = 0; j < ArrowsArray_sm[i].length; j++) {
                        if (l._leaflet_id == ArrowsArray_sm[i][j]._leaflet_id) {
                            if (j == 1) {
                                sm_map.removeLayer(ArrowsArray_sm[i][j + 1]);
                                sm_map.removeLayer(l);
                                ArrowsArray_sm.splice(i, 1);
                                break loop1;
                            } else if (j == 2) {
                                sm_map.removeLayer(l)
                                sm_map.removeLayer(ArrowsArray_sm[i][j]);
                                ArrowsArray_sm.splice(i, 1);
                                break loop1;
                            }
                        }
                    }
                }

            function x(callback) {
                l.options.color = 'red';
                callback();
            };

            function y() {
                drawnItems_sm.addLayer(l);
                drawnItems_sm.eachLayer(function (layers) {
                    if (layers == layer) {
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
                        }).addTo(sm_map);
                        var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);

                        var Linie = [arrowsLayerGroup, layer, arrowHead]
                        ArrowsArray_sm.push(Linie);
                        addStreetPopUpSM(layer);
                    }
                });
            }

            x(y);
        }
    });
}

function ChangeColorBackSM(layer) {
    drawnItems2_sm.eachLayer(function (l) {
        if (l == layer) {
            loop1:
                for (var i = 0; i < ArrowsArray_sm.length; i++) {
                    for (var j = 0; j < ArrowsArray_sm[i].length; j++) {
                        if (l._leaflet_id == ArrowsArray_sm[i][j]._leaflet_id) {
                            if (j == 1) {
                                sm_map.removeLayer(ArrowsArray_sm[i][j + 1]);
                                sm_map.removeLayer(l);
                                ArrowsArray_sm.splice(i, 1);
                                break loop1;
                            } else if (j == 2) {
                                sm_map.removeLayer(l)
                                sm_map.removeLayer(ArrowsArray_sm[i][j]);
                                ArrowsArray_sm.splice(i, 1);
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
                drawnItems_sm.addLayer(l);
                drawnItems_sm.eachLayer(function (layers) {
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
                        }).addTo(sm_map);
                        var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);
                        var Linie = [arrowsLayerGroup, layer, arrowHead]
                        ArrowsArray_sm.push(Linie);

                        addStreetPopUpSM(layer);
                    }
                });
            }

            x(y);
        }
    });
}

//####################################################

function addLandmarkPopupSM(layer) {

    MMLandmarksIDs.sort();
    MMRegionsIDs.sort();

    var LMTable = document.createElement('table');
    LMTable.setAttribute('id', 'LMTable');
    var LMRow1 = LMTable.insertRow(0);
    LMRow1.setAttribute('id', 'LMRow1');
    var features_div1;
    var features_div2;
    var TLM = document.createElement('th');
    TLM.setAttribute('id', 'TLM');
    TLM.innerHTML = 'Landmark';
    LMRow1.insertCell(0).append(TLM);
    var TRegion = document.createElement('th');
    TRegion.setAttribute('id', 'TRegion');
    TRegion.innerHTML = 'Region';
    LMRow1.insertCell(-1).append(TRegion);
    var LMRow2 = LMTable.insertRow(1);
    LMRow2.setAttribute('id', 'LMRow2');
    var LMCell1 = LMRow2.insertCell(0);
    LMCell1.setAttribute('class', 'a');
    var LMCell2 = LMRow2.insertCell(-1);
    LMCell2.setAttribute('class', 'b');

    // if there are more Landmarks than Regions
    if (MMLandmarksIDs.length > MMRegionsIDs.length) {
        features_div1 = document.createElement('div');
        features_div1.setAttribute('id', 'features_div1');
        var lm_input;
        var LM_ID1;
        features_div2 = document.createElement('div');
        features_div2.setAttribute('id', 'features_div2');
        var region_input;
        var Region_ID;

        /**
         * iterate over Landmarks array and add each Landmark to the corresponding column
         * in the table for the popup
         */
        for (i = 1; i <= MMLandmarksIDs.length; i++) {
            lm_input = document.createElement('input');
            var lm_label = document.createElement('label');

            lm_input.setAttribute('type', 'checkbox');//
            lm_input.setAttribute('id', MMLandmarksIDs[i - 1]);// add rate value
            lm_label.setAttribute('for', MMLandmarksIDs[i - 1]);// set for attribute for each label
            lm_label.setAttribute('id', MMLandmarksIDs[i - 1]);// set id for label
            lm_label.setAttribute('style', 'word-wrap:break-word');

            x = document.createTextNode(MMLandmarksIDs[i - 1]);
            lm_label.append(x);
            var br = document.createElement('br');

            features_div1.append(lm_input);
            features_div1.append(lm_label);
            features_div1.append(br);
            LMCell1.append(features_div1);

            /**
             *  if there are no objects from the Regions array left do nothing
             *  else put them in the corresponding column in the table for the popup
             */
            if (i > MMRegionsIDs.length) {
                console.log("i > MMRegionsIDs.length");
            } else {
                region_input = document.createElement('input');
                var region_label = document.createElement('label');

                region_input.setAttribute('type', 'checkbox');//
                region_input.setAttribute('id', MMRegionsIDs[i - 1]);// add rate value
                region_label.setAttribute('for', MMRegionsIDs[i - 1]);// set for attribute for each label
                region_label.setAttribute('id', MMRegionsIDs[i - 1]);// set id for label
                region_label.setAttribute('style', 'word-wrap:break-word');

                x = document.createTextNode(MMRegionsIDs[i - 1]);
                region_label.append(x);
                var br2 = document.createElement('br');

                features_div2.append(region_input);
                features_div2.append(region_label);
                features_div2.append(br2);
                LMCell2.append(features_div2);
            }
        }
        // if there are more Regions than Landmarks
    } else if (MMRegionsIDs.length > MMLandmarksIDs.length) {
        features_div1 = document.createElement('div');
        features_div1.setAttribute('id', 'features_div1');
        var lm_input;
        var LM_ID1;
        features_div2 = document.createElement('div');
        features_div2.setAttribute('id', 'features_div2');
        var region_input;
        var Region_ID;

        /**
         * iterate over Regions array and add each Regions to the corresponding column
         * in the table for the popup
         * if there are no objects from the Regions array left do nothing
         * else put them in the corresponding column in the table for the popup
         */
        for (var i = 1; i <= MMRegionsIDs.length; i++) {
            if (i > MMLandmarksIDs.length) {
                console.log("i > MMStreetIDs.length")
            } else {
                lm_input = document.createElement('input');
                var lm_label = document.createElement('label');

                lm_input.setAttribute('type', 'checkbox');//
                lm_input.setAttribute('id', MMLandmarksIDs[i - 1]);// add rate value
                lm_label.setAttribute('for', MMLandmarksIDs[i - 1]);// set for attribute for each label
                lm_label.setAttribute('id', MMLandmarksIDs[i - 1]);// set id for label
                lm_label.setAttribute('style', 'word-wrap:break-word');

                x = document.createTextNode(MMLandmarksIDs[i - 1]);
                lm_label.append(x);
                var br = document.createElement('br');

                features_div1.append(lm_input);
                features_div1.append(lm_label);
                features_div1.append(br);
            }
            LMCell1.append(features_div1);

            region_input = document.createElement('input');
            var region_label = document.createElement('label');

            region_input.setAttribute('type', 'checkbox');//
            region_input.setAttribute('id', MMRegionsIDs[i - 1]);// add rate value
            region_label.setAttribute('for', MMRegionsIDs[i - 1]);// set for attribute for each label
            region_label.setAttribute('id', MMRegionsIDs[i - 1]);// set id for label
            region_label.setAttribute('style', 'word-wrap:break-word');


            x = document.createTextNode(MMRegionsIDs[i - 1]);
            region_label.append(x);
            var br2 = document.createElement('br');

            features_div2.append(region_input);
            features_div2.append(region_label);
            features_div2.append(br2);
            LMCell2.append(features_div2);
        }
        // if there is an identical number of Landmarks and Regions
    } else if (MMLandmarksIDs.length == MMRegionsIDs.length) {
        features_div1 = document.createElement('div');
        features_div1.setAttribute('id', 'features_div1');
        var lm_input;
        var LM_ID1;
        features_div2 = document.createElement('div');
        features_div2.setAttribute('id', 'features_div2');
        var region_input;
        var Region_ID;

        /**
         * itereate over the Landmarks array and add each Landmark and each Region to the
         * corresponding column in the table for the popup
         */
        for (i = 1; i <= MMLandmarksIDs.length; i++) {
            lm_input = document.createElement('input');
            var lm_label = document.createElement('label');

            lm_input.setAttribute('type', 'checkbox');//
            lm_input.setAttribute('id', MMLandmarksIDs[i - 1]);// add rate value
            lm_label.setAttribute('for', MMLandmarksIDs[i - 1]);// set for attribute for each label
            lm_label.setAttribute('id', MMLandmarksIDs[i - 1]);// set id for label
            lm_label.setAttribute('style', 'word-wrap:break-word');

            x = document.createTextNode(MMLandmarksIDs[i - 1]);
            lm_label.append(x);
            var br = document.createElement('br');

            features_div1.append(lm_input);
            features_div1.append(lm_label);
            features_div1.append(br);
            LMCell1.append(features_div1);


            region_input = document.createElement('input');
            var region_label = document.createElement('label');

            region_input.setAttribute('type', 'checkbox');//
            region_input.setAttribute('id', MMRegionsIDs[i - 1]);// add rate value
            region_label.setAttribute('for', MMRegionsIDs[i - 1]);// set for attribute for each label
            region_label.setAttribute('id', MMRegionsIDs[i - 1]);// set id for label
            region_label.setAttribute('style', 'word-wrap:break-word');

            x = document.createTextNode(MMRegionsIDs[i - 1]);
            region_label.append(x);
            var br2 = document.createElement('br');

            features_div2.append(region_input);
            features_div2.append(region_label);
            features_div2.append(br2);
            LMCell2.append(features_div2);
        }
    }

    layer.bindPopup(LMTable);

    var LMPopup = layer.getPopup();
    LMPopup.options.maxHeight = 250;
    LMPopup.options.maxWidth = 350;


    LMCell1.addEventListener("click", function (event) {
        if ($(event.target).is('[type="checkbox"]')) {
            if ($(event.target).is(':checked')) {
                var LM_val = event.target.id;
                LM_ID1 = LM_val;
                $('input[type="checkbox"]').on('change', function () {
                    $('input[type="checkbox"]').not(this).prop('checked', false);
                });
            }
        }
    });

    LMCell2.addEventListener("click", function (event) {
        if ($(event.target).is('[type="checkbox"]')) {
            if ($(event.target).is(':checked')) {
                var LM_val2 = event.target.id;
                Region_ID = LM_val2;
                $('input[type="checkbox"]').on('change', function () {
                    $('input[type="checkbox"]').not(this).prop('checked', false);
                });
            }
        }
    });

    layer.on("popupclose", function () {
        var k = 0;
        var l = 0;
        for (var i = 0; i < MMLandmarksIDs.length; i++) {
            var LMs = document.getElementById(MMLandmarksIDs[i]);
            if (LMs.checked == true) {
                layer.feature.properties.id = LM_ID1;
                layer.feature.properties.FID = LM_ID1;
                layer.feature.properties.name = LM_ID1;
                layer.feature.properties.feat_type = "Landmark";
                k++;
            }
        }
        for (var j = 0; j < MMRegionsIDs.length; j++) {
            var CBlocks = document.getElementById(MMRegionsIDs[j]);
            if (CBlocks.checked == true) {
                layer.feature.properties.id = Region_ID;
                layer.feature.properties.FID = Region_ID;
                layer.feature.properties.name = Region_ID;
                layer.feature.properties.feat_type = "Cityblock";
                l++
            }
        }
        if (k == 0 && l == 0) {
            alert("ERROR! Do not forget to give the Landmark/Region a name!");
        }
    });
}

//################################################################################################################

function downloadJsonSM() {
    SMGeoJsonData = drawnItems_sm.toGeoJSON();

    var SMGeoJSON = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(SMGeoJsonData));
    document.getElementById('exportSketchFeatures').setAttribute('href', 'data:' + SMGeoJSON);
    document.getElementById('exportSketchFeatures').setAttribute('download', 'SMdata.geojson');
};


function showLabels_sm() {

    sm_map.createPane("pane200").style.zIndex = 200;
    document.getElementById("showLabels_sm").checked = true;
    document.getElementById("hideLabels_sm").checked = false;
    var data = drawnItems_sm.toGeoJSON();
    labelLayer_sm = L.geoJson(data, {
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
    sm_map.addLayer(labelLayer_sm);
    document.getElementById("showLabels_sm").disabled = true;
}

function hideLabels_sm() {

    document.getElementById("hideLabels_sm").checked = true;
    document.getElementById("showLabels_sm").checked = false;
    sm_map.removeLayer(labelLayer_sm);
    document.getElementById("showLabels_sm").disabled = false;
}

function ProcessMap() {
    $("#metricmapplaceholder").hide();
    $("#sketchmapplaceholder1").hide();
    $("#resultholder").show();

};

/**
 - qualify_MM function takes the geojson from metric maps and pass
 - it to the paython function "mmReceiver" that connect qualifier plugin
 **/

function qualify_MM() {
    MMGeoJsonData = drawnItems.toGeoJSON();
    console.log(MMGeoJsonData);
    //var MMGeoJSON = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(MMGeoJsonData));
    console.log("metric map id", metricFileName)
    $.ajax({
        url: '/mmReceiver',
        type: 'POST',
        data: JSON.stringify(MMGeoJsonData),
        contentType: 'application/json',
        //dataType: 'json',
        success: function (resp) {
            alert(resp);
        }
    });

};

/**
 - qualify_SM function takes the geojson from sketch maps and pass
 - it to the paython function "smReceiver" that connect qualifier plugin
 **/
function qualify_SM() {
    SMGeoJsonData = drawnItems_sm.toGeoJSON();
    //var MMGeoJSON = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(MMGeoJsonData));
    $.ajax({
        url: '/smReceiver',
        type: 'POST',
        data: JSON.stringify(SMGeoJsonData),
        contentType: 'application/json',
        //dataType: 'json',
        success: function (resp) {
            alert(resp);
        }
    });

}
//get result from database 
//var sketchID;
function getDatabase_Result() {
    window.open('http://127.0.0.1:5000/results', '_blank');
    console.log("metric map ID", metricFileName);
    console.log("sketch map ID", sketchFileName);
    $.ajax({
        url: '/results',
        type: 'GET',
        data: {metricFileName: metricFileName, sketchFileName: sketchFileName},
        contentType: 'application/json',
        success: function (resp) {
            //console.log(resp);
        }

    });
   //
};

//To download results in the PDF

function downloadResults() {
    //alert("is comming here ")
    html2canvas($('#results_div'), {
        onrendered: function (canvas) {
            var img = canvas.toDataURL();
            var doc = new jsPDF('l', 'mm', 'A4');
            var width = doc.internal.pageSize.width;
            var height = doc.internal.pageSize.height;
            doc.addImage(img, 5, 0, width, height);
            doc.save(sketchFileName + '.pdf');
        }
    });
};

function exportAsCSV() {
    var html = document.querySelector("#correctness >table").outerHTML;
    export_table_to_csv(html, sketchFileName + ".csv");

}

function export_table_to_csv(html, filename) {
    var csv = [];
    var rows = document.querySelectorAll("table tr");

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");

        for (var j = 0; j < cols.length; j++)
            row.push(cols[j].innerText);

        csv.push(row.join(","));
    }
    ;

    // Download CSV
    download_csv(csv.join("\n"), filename);
};

function download_csv(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV FILE
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // We have to create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Make sure that the link is not displayed
    downloadLink.style.display = "none";

    // Add the link to your DOM
    document.body.appendChild(downloadLink);

    // Lanzamos
    downloadLink.click();
};

//initializeDatabase for analysing sketch maps
function initializeDatabase() {
    $.ajax({
        url: '/initializeDatabase',
        //data:{metricFileName: metricFileName, sketchFileName:sketchFileName},
        success: function (resp) {
            alert(resp);
        }

    });
}

/**
 $(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

 **/