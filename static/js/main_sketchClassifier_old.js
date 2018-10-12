/**
 * function allows you to load metric map in the panel
 * @param element
 */
var MMGeoJsonData;
var SMGeoJsonData;
var MMStreetIDs=[];
var MMStreetIDsNew=[]
var MMLandmarksIDs=[];
var sm_map;
var drawnItems_sm;
var drawnItems;
var map;
var labelLayer=null;
var labelLayer_sm = null;
var sketchFileName;
var metricFileName;
var map;

function HideMap(){
	$("#hideMap").hide();
	$("#metricmapplaceholder").hide();
	$("#showMap").show();
	$("#MMLinks").hide();
}

function ShowMap(){
	$("#hideMap").show();
	$("#metricmapplaceholder").show();
	$("#showMap").hide();
	$("#MMLinks").show();
}

function loadMetricMap(element){
	// test if metric map is already loaded or not
	if(document.getElementById('metricmapplaceholder').innerHTML === ""){
		var fileInput;
		var reader= new FileReader();
		fileInput= document.getElementById('MetrichMapInputbutton');
		var file = fileInput.files[0];
		reader.readAsDataURL(file);	

		reader.onload = function(e) {
			
			var container = L.DomUtil.get('map');
				if(container != null){
					container._leaflet_id = null;
			}
			var image = new Image();
			image.title = file.name;
			image.src = this.result;
			document.getElementById('mm').src = image.src;
		
			map = new L.map('metricmapplaceholder',{
				crs: L.CRS.Simple
			});
			
			var bounds = [[0,0], [580,900]];
			var MMLoaded= new L.imageOverlay(image.src, bounds);
			MMLoaded.addTo(map);
			map.fitBounds(bounds);
			var fileName_full = image.title;
			
			fName = fileName_full.split(".");
			
			metricFileName = fName[0];
			$('#span_mm').html(metricFileName);
			$.ajax({
				url:'/metricFileName',
				data:{metricFileName: metricFileName}, 
					success: function( resp ) {
					}
			});
			//loadEditingToolforMM(map);
			$("#hideMap").show();
		
		
			// $("#qualify_MM").prop("disabled", false);
		}
	// if metric map is already loaded delete old one and add new metric map
	}else{
		document.getElementById('metricmapplaceholder').innerHTML = "<div id='map' align='Center' style='width:relative; height:600px; border: none; margin-left: 05px;'></div>";
		
		var fileInput;
		var reader= new FileReader();
		fileInput= document.getElementById('MetrichMapInputbutton');
		var file = fileInput.files[0];
		reader.readAsDataURL(file);	

		reader.onload = function(e) {
			var container = L.DomUtil.get('map');
				if(container != null){
					container._leaflet_id = null;
			}
			var image = new Image();
			image.title = file.name;
			image.src = this.result;
			document.getElementById('mm').src = image.src;
		
			map = new L.map('map',{
				crs: L.CRS.Simple
			});
			
			var bounds = [[0,0], [580,900]];
			var MMLoaded= new L.imageOverlay(image.src, bounds);
			MMLoaded.addTo(map);
			map.fitBounds(bounds);
			var fileName_full = image.title;
			
			fName = fileName_full.split(".");
			
			metricFileName = fName[0];
			$('#span_mm').html(metricFileName);
			//console.log("is comming here...",metricFileName);
			//loadEditingToolforMM(map);
			$("#hideMap").show();

			$.ajax({
			url:'/metricFileName',
			data:{metricFileName: metricFileName}, 
				success: function( resp ) {
				}
			});
			// $("#qualify_MM").prop("disabled", false);
		};
	}
};

// ########################################################################################################
function uploadJsonMM(){
	
	var fileList = document.getElementById('importMetricFeatures').files
	for (var i=0;i<fileList.length;i++){
		randerGeoJsonFiles(fileList[i],map);
	}		
}

function randerGeoJsonFiles(file, map){
	var fileName = file.name;
    var reader= new FileReader();
    reader.readAsDataURL(file);   
	//var loadedJsonLayer;
	reader.onload = function(){
		// load GeoJSON from an external file
        $.getJSON(reader.result,function(data){
			//passing data to qualifier
			MMGeoJsonData = data;
			loadedJsonLayer = L.geoJson(data,{ 
				opacity: 0.5,
				onEachFeature: function (feature, layer) {
					// give ids from MM for landmarks to SM
					if (feature.geometry.type == "Polygon"){
						MMLandmarksIDs.push(feature.properties.id)
					}
					// give ids from MM for streets to SM
					if(feature.geometry.type == "LineString"){
						MMStreetIDs.push(feature.properties.id);
					}
				}
			});
			map.fitBounds(loadedJsonLayer.getBounds());
			loadJsonLayer(map);
		});
	}
}
function loadJsonLayer(map){
	drawnItems= new L.FeatureGroup();
	loadedJsonLayer.eachLayer(
		function(l){
			drawnItems.addLayer(l);
		}
	);
	drawnItems.eachLayer(function(l){
		//console.log(l);
		if(l.feature.geometry.type == "Polygon"){
			//addLandmarkPopupMM(l);
			addJsonLMPopupMM(l)
		}
		if(l.feature.geometry.type == "LineString"){
			//addStreetPopupMM(l);
			arrowHead = L.polylineDecorator(l, {
				patterns: [
					{offset: 25, repeat: 50, endoffset: 0, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})}
				]
			}).addTo(map);
			addJsonStreetPopupMM(l)
		}
	})

	map.addLayer(drawnItems);
}

function addJsonLMPopupMM(l){
	name = l.feature.properties.id
	featureType = l.feature.properties.feat_type;
	var popupContent = document.createElement('div');
	popupContent.id="popupContent";
	var featureId = document.createElement("B");
	var x = document.createTextNode(name);
	featureId.appendChild(x);


	if(featureType == "Landmark"){
		var feaType = document.createTextNode("is Landmark");
	}else if(featureType == "Cityblock"){
		var feaType = document.createTextNode("is Region");
	}
	br = document.createElement("BR");

	popupContent.append(featureId);
	popupContent.append(br);
	popupContent.append(br);
	popupContent.append(feaType);
	
	l.bindPopup(popupContent);
	//l.openPopup();
}
function addJsonStreetPopupMM(l){
	name = l.feature.properties.id
	route = l.feature.properties.isRoute
	var popupContent = document.createElement('div');
	popupContent.id="popupContent";
	var featureId = document.createElement("B");
	var x = document.createTextNode(name);
	featureId.appendChild(x);

	popupContent.append(featureId);

	if(route == "Yes"){
		var isroute = document.createTextNode("Route Segment")
		br = document.createElement("BR");
		popupContent.append(br);
		popupContent.append(br);
		popupContent.append(isroute);
	}
	
	l.bindPopup(popupContent);
	//l.openPopup();
}
//##############################################################################################################################
/**
 * adding toolbar in the map 
 * using leaflet plugin "leaflet.pm" 
 * @param map
 * @returns
 */
/*
function loadEditingToolforMM(map){
	//var guideLayers = [];
	//drawnItems = new L.geoJson();
	drawnItems= new L.FeatureGroup();
	var arrowHead;
	
	//drawnItems.addTo(map);
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
	};
	map.pm.addControls(options);

	/**
	 * now how drawing works
	 * using again leaflet plugin "leaflet.pm"
	 */
	/*
	map.on('pm:create', function(event){
		var layer = event.layer;
		var type = event.shape;
		feature=layer.feature=layer.feature||{};
		feature.type=feature.type||"Feature";
		var props =feature.properties=feature.properties||{};
		props.FID = null;
		props.id = null;
		props.isRoute = null;
		props.name =null;
		props.feat_type=null;
		props.sm_sk_type="rectangle | olopololi | some stuff";
		props.descriptn="something";

		drawnItems.addLayer(layer);
		if (type ==="Line"){
			addStreetPopupMM(layer);
			console.log(MMStreetIDs);
			arrowHead = L.polylineDecorator(layer, {
				patterns: [
					{offset: 25, repeat: 50, endoffset: 0, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})}
				]
			}).addTo(map);
		}
		if (type==="Poly"){
			addLandmarkPopupMM(layer);
		}
	});
	
	map.on('pm:remove', function(event){
		layerid = event.layer._leaflet_id;
		console.log(event.layer);
		//console.log(drawnItems);
		//console.log(layerid);
		deleteFunction();
	})
	function deleteFunction(){
		drawnItems.eachLayer(function(l){
			//console.log(l._leaflet_id);
			jsonId = l._leaflet_id;
			
			if(layerid == jsonId){
				drawnItems.removeLayer(l);
				console.log(l.feature.properties.id);
				for(i = 0; i<MMStreetIDs.length; i++){
					if (MMStreetIDs[i] != l.feature.properties.id){
						MMStreetIDsNew.push(l.feature.properties.id)
						console.log(MMStreetIDs[i]);
						console.log(l.feature.properties.id);
						
					}
				}
				console.log(MMStreetIDsNew);
				MMStreetIDs=[];
				MMStreetID = MMStreetIDsNew;


				for(i = 0; i<MMLandmarksIDs.length; i++){
					if (MMLandmarksIDs[i] == l.feature.properties.id){
						MMLandmarKsIDs.splice(i, 1);
					}
				}
				//console.log(drawnitems);
			}
		})
	}
}
*/

/**
 * the function create popUp that contains box for ID 
 * and checkbox for being a segment as route part
 */
/*
function addStreetPopupMM(layer){
	var popupContent= document.createElement('div');
	popupContent.id="popupCOntent";
	var featurId = document.createElement("input");
	featurId.id="featurId";
	var featurIdLabel = document.createElement("label");
	featurIdLabel.setAttribute = ("for", "featurId");
	featurIdLabel.appendChild(document.createTextNode('St_ID'));

	var labelRoute = document.createElement('label');
	labelRoute.id = "id";
	labelRoute.setAttribute = ("for", "isRoute");
	labelRoute.appendChild(document.createTextNode("RouteSegment?"));

	var isRoute=document.createElement("input");
	isRoute.type = "checkbox";
	isRoute.id = "isRoute";
	isRoute.name = "isRoute";
	isRoute.value = "No";
	popupContent.append(featurIdLabel);
	popupContent.append(featurId);
	popupContent.append(labelRoute);
	popupContent.append(isRoute);
	layer.bindPopup(popupContent);
	layer.openPopup();
	featurId.addEventListener("keyup", function(){

		layer.feature.properties.id = featurId.value;
		layer.feature.properties.FID = featurId.value;
		layer.feature.properties.name = featurId.value;

	});
	isRoute.addEventListener("click",clickedFunction, false);
	function clickedFunction(){
		isRoute.setAttribute("value","Yes");
		layer.feature.properties.isRoute = isRoute.value;
	}

	layer.on("popupopen",function(){
		featurId.value = layer.feature.properties.id;
		isRoute.value = layer.feature.properties.isRoute;
		featurId.focus();
	});
	
	featurId.addEventListener("focusout", function(e){
		console.log(featurId.value);
		if (MMStreetIDs.includes(featurId.value)){
		}else{
			MMStreetIDs.push(featurId.value);
		}
	});
}
*/

/*
function addLandmarkPopupMM(layer){
	var popupContent= document.createElement('div');
	popupContent.id="popupCOntent";
	var featurId = document.createElement("input");
	featurId.id="featurId";
	var featurIdLabel = document.createElement("label");
	featurIdLabel.setAttribute = ("for", "featurId");
	featurIdLabel.appendChild(document.createTextNode('LM_ID'));


	var islandmarkCityblock= document.createElement('div');

	var labelLandmark = document.createElement('label');
	labelLandmark.id = "id";
	labelLandmark.setAttribute = ("for", "isLandmark");
	labelLandmark.appendChild(document.createTextNode("is_Landmark?"));

	var isLandmark=document.createElement("input");
	isLandmark.type = "checkbox";
	isLandmark.id = "isLandmark";
	isLandmark.name = "isLandmark";
	isLandmark.value = "null";

	var labelCityblock = document.createElement('label');
	labelCityblock.id = "id";
	labelCityblock.setAttribute = ("for", "isCityblock");
	labelCityblock.appendChild(document.createTextNode("is_Region?"));

	var isCityblock=document.createElement("input");
	isCityblock.type = "checkbox";
	isCityblock.id = "isCityblock";
	isCityblock.name = "isCityblock";
	isCityblock.value = "null";
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
	layer.openPopup();

	featurId.addEventListener("keyup", function(){
		layer.feature.properties.id = featurId.value;
		layer.feature.properties.FID = featurId.value;
		layer.feature.properties.name = featurId.value;
	});


	isLandmark.addEventListener("click",clickedFunction1, false);
	function clickedFunction1(){
		isLandmark.setAttribute("value","Landmark");
		layer.feature.properties.feat_type = isLandmark.value;
	}


	isCityblock.addEventListener("click",clickedFunction2, false);
	function clickedFunction2(){
		isCityblock.setAttribute("value","Cityblock");
		layer.feature.properties.feat_type = isCityblock.value;
	}

	
	layer.on("popupopen",function(){
		featurId.value = layer.feature.properties.id;
		isCityblock.value= layer.feature.properties.feat_type ;
		featurId.focus();
	});
	
	featurId.addEventListener("focusout", function(e){

		if (MMLandmarksIDs.includes(featurId.value)){
		}else{
			MMLandmarksIDs.push(featurId.value);
		}
	});
	
}
*/


//}	
function downloadJsonMM(){
	MMGeoJsonData = drawnItems.toGeoJSON();
	// Stringify the GeoJson
	var mmGeojson = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(MMGeoJsonData));
	// Create export
	document.getElementById('exportMetricFeatures').setAttribute('href', 'data:' + mmGeojson);
	document.getElementById('exportMetricFeatures').setAttribute('download','MM_fileName.geojson');
}

function showLabels(){
	document.getElementById("showLabels").checked = true;
	document.getElementById("hideLabels").checked = false;

	var data= drawnItems.toGeoJSON();
	labelLayer=L.geoJson(data,{
		onEachFeature: function (feature, layer) {
			var temLayer = layer;
			temLayer.bindTooltip(feature.properties.id, {permanent: true, direction: 'auto' });
			return temLayer;
		}
	});
	labelLayer.addTo(map);
	document.getElementById("showLabels").disabled = true;
}
/**
//function showLabels(){
//document.getElementById("showLabels").checked = true;
//document.getElementById("hideLabels").checked = false;
//map.addLayer(labelLayer);
//}
 **/
function hideLabels(){
	document.getElementById("hideLabels").checked = true;
	document.getElementById("showLabels").checked = false;
	map.removeLayer(labelLayer);
	document.getElementById("showLabels").disabled = false;
}



/**
 * function allows you to load Sketch map in the panel
 * @param element
 */
function loadSketchMap(element){
	// test if sketch map is already loaded or not
	if(document.getElementById('sketchmapplaceholder1').innerHTML === ""){
		var fileInput;
		var reader= new FileReader();
		fileInput= document.getElementById('SketchMapInputbutton');
		var file = fileInput.files[0];
		reader.readAsDataURL(file);	

		reader.onload = function(e) {
			var container = L.DomUtil.get('sm_map');
				if(container != null){
					container._leaflet_id = null;
			}
			var image = new Image();
			image.title = file.name;
			image.src = this.result;
			document.getElementById('sm1').src = image.src;

			sm_map = new L.map('sketchmapplaceholder1',{crs: L.CRS.Simple});
			
			var bounds = [[0,0], [580,900]];
			sm_map.fitBounds(bounds);
			var MMLoaded= new L.imageOverlay(image.src, bounds);
			MMLoaded.addTo(sm_map);
			

			var fileName_full = image.title;
			fName = fileName_full.split(".");
			sketchFileName = fName[0];
			
			$('#span_sm1').html(sketchFileName);
			loadEditingToolforSM(sm_map);

			$("#SMLinks").show();
			$.ajax({
				url:'/sketchFileName',
				data:{sketchFileName: sketchFileName}, 
				success: function( resp ) {
				}
			});

		}
	// if sketch map is already loaded, delete old SM and add new SM
	}else{
		document.getElementById('sketchmapplaceholder1').innerHTML = "<div id='sketchmap' align='Center' style='width:relative; height:600px; border: none; margin-left: 05px;'></div>";

		var fileInput;
		var reader= new FileReader();
		fileInput= document.getElementById('SketchMapInputbutton');
		var file = fileInput.files[0];
		reader.readAsDataURL(file);	

		reader.onload = function(e) {
				var container = L.DomUtil.get('sm_map');
				if(container != null){
					container._leaflet_id = null;
			}
			var image = new Image();
			image.title = file.name;
			image.src = this.result;
			document.getElementById('sm1').src = image.src;

			sm_map = new L.map('sketchmap',{crs: L.CRS.Simple});
			
			var bounds = [[0,0], [580,900]];
			sm_map.fitBounds(bounds);
			var MMLoaded= new L.imageOverlay(image.src, bounds);
			MMLoaded.addTo(sm_map);
			

			var fileName_full = image.title;
			fName = fileName_full.split(".");
			sketchFileName = fName[0];
			
			$('#span_sm1').html(sketchFileName);
			loadEditingToolforSM(sm_map);

			$("#SMLinks").show();
			$.ajax({
				url:'/sketchFileName',
				data:{sketchFileName: sketchFileName}, 
				success: function( resp ) {
				}
			});	

		}
	}
	/**
	var data= drawnItems.toGeoJSON();
    L.geoJson(data,{
        onEachFeature: function (feature, layer) {
                if(feature.geometry.type =="LineString"){
					console.log(MMStreetIDs);
                    MMStreetIDs.push(feature.properties.id);
                }if(feature.geometry.type =="Polygon"){
                     MMLandmarksIDs.push(feature.properties.id)
                }
            }
		});
	**/
}
/**
 * adding toolbar in the map 
 * using leaflet plugin "leaflet.pm" 
 * 
 */
function loadEditingToolforSM(sm_map){

	drawnItems_sm = new L.FeatureGroup();
	//drawnItems.addTo(map);
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
	sm_map.on('pm:create', function(event){
		var layer = event.layer;
		var type = event.shape;
		feature=layer.feature=layer.feature||{};
		feature.type=feature.type||"Feature";
		var props =feature.properties=feature.properties||{};
		props.FID=null;
		props.id=null;
		props.isRoute=null;
		props.name=null;
		props.feat_type=null;
		props.sm_sk_type="rectangle | olopololi | some stuff";
		props.descriptn="something";

		drawnItems_sm.addLayer(layer);
		if(type==="Line"){
			addStreetPopUpSM(layer);
			var arrowHead = L.polylineDecorator(layer, {
				patterns: [
					{offset: 25, repeat: 70, endoffset: 0, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})}
				]
			}).addTo(sm_map);
		}
		if(type==="Poly"){
			addLandmarkPopupSM(layer);
		}
	});

	// if drawn object get deleted remove it from geoJSON file 
	sm_map.on('pm:remove', function(event){
		layerid = event.layer._leaflet_id;
		//console.log(drawnItems_sm);
		//console.log(layerid);
		deleteFunction_sm();
	})
	function deleteFunction_sm(){
		drawnItems_sm.eachLayer(function(l){
			//console.log(l._leaflet_id);
			jsonId = l._leaflet_id;
			
			if(layerid == jsonId){
				drawnItems_sm.removeLayer(l);
				//console.log(darwnItems_sm);
			}
		})
	}
}

function addStreetPopUpSM(layer){
	var options= MMStreetIDs;
	if (options.length != 0){

        var popUp_div= document.createElement('div');
        popUp_div.setAttribute("id","popUp");

        var fetureID_div= document.createElement('div');
        fetureID_div.setAttribute("id","fetureID_div");
        var checkedID;
        for (var i = 0; i <options.length; i++) {
            checkedID = document.createElement('input');
            var label = document.createElement('label');

            checkedID.setAttribute('type', 'checkbox');//
            checkedID.setAttribute('value', options[i]);// add rate value
            checkedID.setAttribute('name', options[i]);// add rate name
            checkedID.setAttribute('id', options[i]);// add rate value
            label.setAttribute('for', options[i]);// set for attribute for each label
            label.setAttribute('id', options[i]);// set id for label

            var opt = document.createElement('option');
            opt.value = options[i];
            opt.appendChild(document.createTextNode(options[i]));

            checkedID.appendChild(opt);
			label.appendChild(opt);
			var br = document.createTextNode("         ");

            fetureID_div.append(label);
			fetureID_div.append(checkedID);
			fetureID_div.append(br);
        };
        var isRouteDIV= document.createElement('div');
        isRouteDIV.setAttribute("id","isRouteDIV")

        var labelRoute = document.createElement('label');
        labelRoute.id = "id";
        labelRoute.setAttribute = ("for", "isRoute");
        labelRoute.appendChild(document.createTextNode("RouteSegment?"));

        var isRoute=document.createElement("input");
        isRoute.type = "checkbox";
        isRoute.id = "isRoute";
        isRoute.name = "isRoute";
        isRoute.value = "No";

        isRouteDIV.append(labelRoute)
		isRouteDIV.append(isRoute)

        popUp_div.append(fetureID_div);
        popUp_div.append(isRouteDIV);

        layer.bindPopup(popUp_div);
        layer.openPopup();

        /**
        if checkbox is checked then pass the value to feature_id
         **/
        var streetIds;
        fetureID_div.addEventListener ("click", function(event){
            //var elementId = event.target.id;
            if ($(event.target).is('[type="checkbox"]')){
                if ($ (event.target).is (":checked")){
                    //console.log (event.target.id);
                    var val = event.target.value;
                    //console.log (val);
                    streetIds = val;
                }
            }
        });

        /**
        if checkbox is checked then pass the value to feature id
         **/
        popUp_div.addEventListener("focusout", function(event){
            console.log (streetIds);
            layer.feature.properties.id = streetIds
            layer.feature.properties.FID = streetIds;
            layer.feature.properties.name = streetIds;
        });


        isRoute.addEventListener("click",RouteClickedFunction);
        function RouteClickedFunction(){
            //alert(isRoute.value);
            isRoute.setAttribute("value","Yes");
            layer.feature.properties.isRoute = isRoute.value;
        };
        /**
        layer.on("popupopen",function(){
            input.value = layer.feature.properties.id;
            isRoute.value = layer.feature.properties.isRoute;
            input.focus();
        });
         **/
	}else{
    }
}



function addLandmarkPopupSM(layer){
	var options = MMLandmarksIDs;
    if (options.length != 0){
        var maindiv= document.createElement('div');
        var SM_landmarkID_div= document.createElement('div');
        SM_landmarkID_div.setAttribute("id","SM_landmarkID_div");

        for (var i = 0; i <options.length; i++) {
            var lm_input = document.createElement('input');
            var lm_label = document.createElement('label');
            lm_input.setAttribute('type', 'checkbox');//
            lm_input.setAttribute('value', options[i]);// add rate value
            lm_input.setAttribute('name', options[i]);// add rate name
            lm_input.setAttribute('id', options[i]);// add rate value

            lm_label.setAttribute('for', options[i]);// set for attribute for each label
            lm_label.setAttribute('id', options[i]);// set id for label

            var opt = document.createElement('option');
            opt.value = options[i];
            opt.appendChild(document.createTextNode(options[i]));

            lm_input.appendChild(opt);
			lm_label.appendChild(opt);
			var br = document.createTextNode("         ");

            SM_landmarkID_div.append(lm_label);
			SM_landmarkID_div.append(lm_input);
			SM_landmarkID_div.append(br);

        };

        var islandmarkCityblock= document.createElement('div');

        var labelLandmark = document.createElement('label');
        labelLandmark.id = "id";
        labelLandmark.setAttribute = ("for", "isLandmark");
        labelLandmark.appendChild(document.createTextNode("is_Landmark?"));

        var isLandmark=document.createElement("input");
        isLandmark.type = "checkbox";
        isLandmark.id = "isLandmark";
        isLandmark.name = "isLandmark";
        isLandmark.value = "null";

        var labelCityblock = document.createElement('label');
        labelCityblock.id = "id";
        labelCityblock.setAttribute = ("for", "isCityblock");
        labelCityblock.appendChild(document.createTextNode("is_Region?"));

        var isCityblock=document.createElement("input");
        isCityblock.type = "checkbox";
        isCityblock.id = "isCityblock";
        isCityblock.name = "isCityblock";
        isCityblock.value = "null";


        islandmarkCityblock.append(labelLandmark)
		islandmarkCityblock.append(isLandmark)
		islandmarkCityblock.append(br);
        islandmarkCityblock.append(labelCityblock)
        islandmarkCityblock.append(isCityblock)

        maindiv.append(SM_landmarkID_div)
        maindiv.append(islandmarkCityblock)
        layer.bindPopup(maindiv);
        layer.openPopup();
        var ladmark_id;
        SM_landmarkID_div.addEventListener ("click", function(event){
            if ($(event.target).is('[type="checkbox"]')){
                if ($ (event.target).is (":checked")){
                    //console.log (event.target.id);
                    var val_lm = event.target.value;
                    //console.log (val_lm);
                    ladmark_id = val_lm;
                }
            }
        });



        isLandmark.addEventListener("click",clickedFunction3, false);
        function clickedFunction3(){
            isLandmark.setAttribute("value","Landmark");
            layer.feature.properties.feat_type = isLandmark.value;
        };


        isCityblock.addEventListener("click",clickedFunction4, false);
        function clickedFunction4(){
            isCityblock.setAttribute("value","Cityblock");
            layer.feature.properties.feat_type = isCityblock.value;
        };

        SM_landmarkID_div.addEventListener("focusout", function(e){
            console.log (ladmark_id);
            layer.feature.properties.id = ladmark_id
            layer.feature.properties.FID = ladmark_id;
            layer.feature.properties.name = ladmark_id;
        });
        /**
        layer.on("popupopen",function(){
            lm_input.value = layer.feature.properties.id;
            lm_input.focus();
        });
         **/
	}else{
	 }
}

function downloadJsonSM(){
	SMGeoJsonData = drawnItems_sm.toGeoJSON();
	var SMGeoJSON = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(SMGeoJsonData));
	document.getElementById('exportSketchFeatures').setAttribute('href', 'data:' + SMGeoJSON);
	document.getElementById('exportSketchFeatures').setAttribute('download','SMdata.geojson');
};


function showLabels_sm(){

   	document.getElementById("showLabels_sm").checked = true;
	document.getElementById("hideLabels_sm").checked = false;
	   var data= drawnItems_sm.toGeoJSON();
        labelLayer_sm=L.geoJson(data,{
            onEachFeature: function (feature, layer) {
                var temLayer = layer;
                temLayer.bindTooltip(feature.properties.id, {permanent: true, direction: 'auto' });
                return temLayer;
            }
        });
        sm_map.addLayer(labelLayer_sm);
       document.getElementById("showLabels_sm").disabled=true;
}
function hideLabels_sm(){

	document.getElementById("hideLabels_sm").checked = true;
	document.getElementById("showLabels_sm").checked = false;
	sm_map.removeLayer(labelLayer_sm);
	document.getElementById("showLabels_sm").disabled=false;
}

function ProcessMap(){
	$("#metricmapplaceholder").hide();
	$("#sketchmapplaceholder1").hide();
	$("#resultholder").show();

};
/**
 - qualify_MM function takes the geojson from metric maps and pass
 - it to the paython function "mmReceiver" that connect qualifier plugin
 **/

function qualify_MM(){
	MMGeoJsonData = drawnItems.toGeoJSON();
	//var MMGeoJSON = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(MMGeoJsonData));
	console.log("metric map id",metricFileName)
	$.ajax({
		url:'/mmReceiver',
		type: 'POST',
		data: JSON.stringify(MMGeoJsonData),
		contentType : 'application/json',
		//dataType: 'json',
		success: function( resp ) {
			alert( resp );
		}
	});

};

/**
 - qualify_SM function takes the geojson from sketch maps and pass 
 - it to the paython function "smReceiver" that connect qualifier plugin
 **/
function qualify_SM(){

	SMGeoJsonData = drawnItems_sm.toGeoJSON();
	//var MMGeoJSON = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(MMGeoJsonData));
	
	$.ajax({
		url:'/smReceiver',
		type: 'POST',
		data: JSON.stringify(SMGeoJsonData),
		contentType : 'application/json',
		//dataType: 'json',
		success: function( resp ) {
			alert( resp );
		}
	});

};
//get result from database 
//var sketchID;
function getDatabaseResult(){
	console.log("metric map ID",metricFileName)
	console.log("sketch map ID",sketchFileName)
	$.ajax({
		url:'/results',
		data:{metricFileName: metricFileName, sketchFileName:sketchFileName}, 
		success: function( resp ) {
		}

	});
	window.open('http://127.0.0.1:5000/results','_blank');
};

//To download results in the PDF

function downloadResults(){
	//alert("is comming here ")
	html2canvas($('#results_div'), {
		onrendered: function(canvas) {
			var img = canvas.toDataURL();
			var doc = new jsPDF('l', 'mm','A4');
		    var width = doc.internal.pageSize.width;
            var height = doc.internal.pageSize.height;
			doc.addImage(img,5,0,width,height);
			doc.save(sketchFileName+'.pdf');
		}
	});
};

function exportAsCSV(){
	var html = document.querySelector("#correctness >table").outerHTML;
	export_table_to_csv(html, sketchFileName+".csv");
	
}	;

function export_table_to_csv(html, filename) {
	var csv = [];
	var rows = document.querySelectorAll("table tr");
	
    for (var i = 0; i < rows.length; i++) {
		var row = [], cols = rows[i].querySelectorAll("td, th");
		
        for (var j = 0; j < cols.length; j++) 
            row.push(cols[j].innerText);
        
		csv.push(row.join(","));		
	};

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
function initializeDatabase(){
	$.ajax({
		url:'/initializeDatabase',
		//data:{metricFileName: metricFileName, sketchFileName:sketchFileName}, 
		success: function( resp ) {
			alert( resp );
		}

	});
}
/**
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

**/