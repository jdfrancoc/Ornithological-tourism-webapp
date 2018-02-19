//Map variables
var map;
var tb;
var grid;
var capas4;
var capas2;
 var outFields = ["*"];
 var marcador;
 var bookmarks_list;
 var map, tb2,mxdRaster;
	 var record;
	 var myDialog;
  var gpViewshed;
  var contador=false;
  var capas5;
  var gpparkings;
	  
	  
	  function borrarLinea(){
		 map.graphics.clear();
	  }
	  //Using google graphics
	  google.load("visualization", "1", {packages:["corechart"]});
 
 //---------------------------------AGOL--------------------------------
 function cargaMapaWeb(idWebMap){
	  	require(["esri/map",
			"esri/layers/FeatureLayer",
		 	"esri/arcgis/utils",
		 	"dojo/_base/array",
			"esri/dijit/PopupTemplate"],
		function(Map,
			FeatureLayer,
			arcgisUtils,
			array,
			PopupTemplate) {

				var mapDeferred = arcgisUtils.createMap(idWebMap, "map");
				mapDeferred.then(function(response){
					//Si vamos a usar un popup sobre esta capa descomentar y configurar lo siguiente
          //Uncomment if using a popup on this layer and configure
					/*var 	 = new PopupTemplate({
					  title: "{texto}",
					  description: "{id}"
					});
					*/
					var id;
					//var title = "municipios";
					var title = "municpios";
					var layers = response.itemInfo.itemData.operationalLayers;
					array.some(layers, function(layer){
				  		if(layer.title === title){
							id = layer.id;
							if(layer.featureCollection && layer.featureCollection.layers.length){
								id = layer.featureCollection.layers[0].id;
								var featureCollection2 = {
									layerDefinition: layer.featureCollection.layers[0].layerDefinition,
									featureSet: layer.featureCollection.layers[0].featureSet
								};
								var featureLayer2 = new esri.layers.FeatureLayer(featureCollection2, {
									mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
									//Si usamos template descomentar lo siguiente
                  //Uncomment if using a template
									//infoTemplate: popupTemplate
								});
								map.addLayers([featureLayer2, 0]);
							}
						return true;  
					  	}else{
							return false;
					  	}
					});
				});
			});
		}

//-------------------------Query y Grid edificios--------------------------------
function qclick(){
	 require(["esri/map",
        "esri/dijit/OverviewMap",
        "dojo/parser", 
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "dojo/on",
        "esri/tasks/QueryTask",
        "esri/tasks/query",
        "esri/tasks/FeatureSet",
        "dojo/_base/array",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/graphic",
        "esri/layers/FeatureLayer",

        "dojo/data/ItemFileReadStore",
        "dojox/grid/DataGrid",



        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer",
        "dojo/domReady!"], function(
          Map,
          OverviewMap,
          parser,
          ArcGISDynamicMapServiceLayer,
          on,
          QueryTask,
          Query,
          FeatureSet,
          arrayUtils,
          SimpleMarkerSymbol,
          Graphic,
          FeatureLayer,

          ItemFileReadStore,
          DataGrid

          ) {

        //parser.parse(); 
  
        var gridq= document.getElementById("gridedi");
          	gridq.style.display="block";
        capas2.on("click",seleccionarEnGrid);

          // change cursor to indicate features are click-able
          capas2.on("mouse-over", function() {
            map.setMapCursor("pointer");
          });
          capas2.on("mouse-out", function() {
            map.setMapCursor("default");
          });

          function seleccionarEnGrid(e) {
          	
    
            var id = e.graphic.attributes.OBJECTID;
            // select the feature that was clicked
            var query = new Query();
            query.objectIds = [id];
            var states = map.getLayer("capaFeature");
            states.selectFeatures(query, FeatureLayer.SELECTION_NEW);
            
            // select the corresponding row in the grid
            // and make sure it is in view
            grid.selection.clear();

            //Si queremos que se seleccione en el grid
            //If we want the grid to be selected
            var numFila= GetGridItemIndexByGridItem(id);
            
            grid.selection.setSelected(numFila,true);
            grid.scrollToRow(grid,numFila);
              //grid.clearSelection();
            grid.select(id);
            grid.row(id).element.scrollIntoView();
          }

          


        var symbolMarker = new SimpleMarkerSymbol({
            "color": [255,255,255,0],
            "size": 3,
            "angle": -30,
            "xoffset": 0,
            "yoffset": 0,
            "type": "esriSMS",
            "style": "esriSMSCircle",
            "outline": {
              "color": [0,0,0,255],
              "width": 3,
              "type": "esriSLS",
              "style": "esriSLSSolid"
            }
        });

       
       on(dojo.byId("botonConsulta"),"click",LanzarQueryF);

       function LanzarQueryF(){
        var queryTask = new QueryTask("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/1");
        var query = new Query();
        query.where="sub1_Nombr='" + dojo.byId("where").value + "'";
        query.returnGeometry=true ;
        query.outFields = ["OBJECTID","rec_Nombre","Mun_INE"];
        queryTask.execute(query, showResults);
       }

       function showResults(valores){

        var items = arrayUtils.map(valores.features, function (result) {
          var graphic = new Graphic(result.geometry,symbolMarker,result.attributes);
          map.graphics.add(graphic);
          return result.attributes;
        });


        var data = {
            identifier : "OBJECTID", //This field needs to have unique values
            items : items
        };
        var store = new dojo.data.ItemFileReadStore({data:data});
            grid.setStore(store);
        
        }
        grid.on("rowclick", onRowClickHandler);

        function onRowClickHandler(evt) {
          var clickedTaxLotId = evt.grid.getItem(evt.rowIndex).OBJECTID;
          var selectedTaxLot = arrayUtils.filter(map.graphics.graphics, function (graphic) {
            return ((graphic.attributes) && graphic.attributes.OBJECTID === clickedTaxLotId);
          });
          if ( selectedTaxLot.length ) {
            map.centerAndZoom(selectedTaxLot[0].geometry,15);
            
          }
        }
          function GetGridItemIndexByGridItem(grid,objectID) { 
            for (var i = 0; i < grid.rowCount; i++) { 
               var element = grid.store.arrayOfAllItems[i];
                if (element.OBJECTID[0] == objectID) { 
                    gridItemIndex = i; 
                    
                    break;
                    
                } 
            } 
            return gridItemIndex; 
            
          }

      });
      function GetGridItemIndexByGridItem(grid,objectID) { 
            for (var i = 0; i < grid.rowCount; i++) { 
               var element = grid.store.arrayOfAllItems[i];
                if (element.OBJECTID[0] == objectID) { 
                    gridItemIndex = i; 
                    
                    break;
                    
                } 
            } 
            return gridItemIndex; 
            
          }
}
//-------------------------Query and Grid Observatorios--------------------------------
function qclick2(){
	 require(["esri/map",
        "esri/dijit/OverviewMap",
        "dojo/parser", 
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "dojo/on",
        "esri/tasks/QueryTask",
        "esri/tasks/query",
        "esri/tasks/FeatureSet",
        "dojo/_base/array",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/graphic",
        "esri/layers/FeatureLayer",

        "dojo/data/ItemFileReadStore",
        "dojox/grid/DataGrid",



        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer",
        "dojo/domReady!"], function(
          Map,
          OverviewMap,
          parser,
          ArcGISDynamicMapServiceLayer,
          on,
          QueryTask,
          Query,
          FeatureSet,
          arrayUtils,
          SimpleMarkerSymbol,
          Graphic,
          FeatureLayer,

          ItemFileReadStore,
          DataGrid

          ) {

        //parser.parse(); 
  
var grida= document.getElementById("gridave");
          	grida.style.display="block";
       capas5.on("click",seleccionarEnGrid);

 // change cursor to indicate features are click-able
          capas5.on("mouse-over", function() {
            map.setMapCursor("pointer");
          });
          capas5.on("mouse-out", function() {
            map.setMapCursor("default");
          });

          function seleccionarEnGrid(e) {
          	
    
            var id = e.graphic.attributes.OBJECTID;
            // select the feature that was clicked
            var query = new Query();
            query.objectIds = [id];
            var states = map.getLayer("capaFeature2");
            states.selectFeatures(query, FeatureLayer.SELECTION_NEW);
            
            // select the corresponding row in the grid
            // and make sure it is in view
            grid.selection.clear();

            //Si queremos que se seleccione en el grid
            //If we want the grid to be selected
            var numFila= GetGridItemIndexByGridItem(id);
          
            grid.selection.setSelected(numFila,true);
            grid.scrollToRow(grid,numFila);
              //grid.clearSelection();
            grid.select(id);
            grid.row(id).element.scrollIntoView();
          }

          


        var symbolMarker = new SimpleMarkerSymbol({
            "color": [255,255,255,0],
            "size": 3,
            "angle": -30,
            "xoffset": 0,
            "yoffset": 0,
            "type": "esriSMS",
            "style": "esriSMSCircle",
            "outline": {
              "color": [0,0,0,255],
              "width": 3,
              "type": "esriSLS",
              "style": "esriSLSSolid"
            }
        });

       
       on(dojo.byId("botonConsulta2"),"click",LanzarQueryF2);

       function LanzarQueryF2(){
        var queryTask2 = new QueryTask("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/4");
        var query2 = new Query();
        query2.where="Aves LIKE '%" + dojo.byId("aves").value+"%'";
        query2.returnGeometry=true ;
        query2.outFields = ["OBJECTID","rec_Nombre","Mun_INE","Aves"];
        queryTask2.execute(query2, showResults);
       }

       function showResults(valores){

        var items = arrayUtils.map(valores.features, function (result) {
          var graphic = new Graphic(result.geometry,symbolMarker,result.attributes);
          map.graphics.add(graphic);
          return result.attributes;
        });


        var data = {
            identifier : "OBJECTID", //This field needs to have unique values
            items : items
        };
        var store = new dojo.data.ItemFileReadStore({data:data});
            grid.setStore(store);
        
        }
        grid.on("rowclick", onRowClickHandler);

        function onRowClickHandler(evt) {
          var clickedTaxLotId = evt.grid.getItem(evt.rowIndex).OBJECTID;
          var selectedTaxLot = arrayUtils.filter(map.graphics.graphics, function (graphic) {
            return ((graphic.attributes) && graphic.attributes.OBJECTID === clickedTaxLotId);
          });
          if ( selectedTaxLot.length ) {
            map.centerAndZoom(selectedTaxLot[0].geometry,15);
            
          }
        }
/*function GetGridItemIndexByGridItem(grid,objectID) { 
            for (var i = 0; i < grid.rowCount; i++) { 
               var element = grid.store.arrayOfAllItems[i];
                if (element.OBJECTID[0] == objectID) { 
                    gridItemIndex = i; 
                    
                    break;
                    
                } 
            } 
            return gridItemIndex; 
            
          }*/

      });
      function GetGridItemIndexByGridItem(grid,objectID) { 
            for (var i = 0; i < grid.rowCount; i++) { 
               var element = grid.store.arrayOfAllItems[i];
                if (element.OBJECTID[0] == objectID) { 
                    gridItemIndex = i; 
                    
                    break;
                    
                } 
            } 
            return gridItemIndex; 
            
          }
}


//--------------------Funcion para mostrar u ocultar el panel searchBox
//--------------------Show/hide searchBox panel function
function fclick() {
	element = document.getElementById("searchBox");
	if (element.style.display == "block") {
		element.style.display = "none";
	} else {
		element.style.display = "block";
	}
}

//-----------------------------Seleccionar mapa base------------------------
//-----------------------------Basemap Selection----------------------------
function mbclick() {
	element = document.getElementById("MapaBase");
	if (element.style.display == "block") {
		element.style.display = "none";
	} else {
		element.style.display = "block";
	}
}

//----------------------ventana de perfil---------------------
//----------------------Profile window------------------------
function pclick() {
	element = document.getElementById("Perfil");
	if (element.style.display == "block") {
		element.style.display = "none";
	} else {
		element.style.display = "block";
	}
}

//----------------Require----------------------------
require(["esri/map",
  "esri/tasks/IdentifyTask",
        "esri/tasks/IdentifyParameters",
        "esri/InfoTemplate",
"esri/tasks/Geoprocessor",
"dijit/Dialog",
"esri/symbols/PictureFillSymbol", "esri/symbols/CartographicLineSymbol",
"esri/tasks/GeometryService",
  "esri/dijit/editing/Editor",
  "esri/dijit/editing/TemplatePicker",
  "esri/config",
"esri/dijit/Bookmarks",
"dojo/data/ItemFileReadStore",
        "dojox/grid/DataGrid",
"esri/tasks/QueryTask", 
"dojo/_base/declare",
  "esri/toolbars/draw",
  "esri/graphic",
  "esri/graphicsUtils",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/tasks/PrintTemplate",
  
  "esri/tasks/Geoprocessor",
  "esri/tasks/FeatureSet",
  "esri/tasks/LinearUnit",
  "esri/dijit/Print",
  
  "dojo/ready", 
  "dojo/parser", 
  "dojo/on",
  "dojo/_base/Color",
  "dojo/_base/array","esri/map", "esri/tasks/PrintTemplate", "esri/dijit/Print", "dijit/TooltipDialog", "dijit/popup", "esri/tasks/query", "dgrid/OnDemandGrid", "dgrid/Selection", "esri/toolbars/draw", "dojo/_base/array", "esri/symbols/TextSymbol", "esri/symbols/Font", "dojo/on", "esri/graphic", "esri/dijit/BasemapGallery", "esri/dijit/Geocoder", "esri/symbols/SimpleMarkerSymbol", "esri/tasks/locator", "esri/dijit/Directions", "esri/dijit/Legend", "esri/dijit/Scalebar", "esri/layers/FeatureLayer", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "dojo/dom", "dojo/parser", "dojo/_base/Color", "esri/dijit/OverviewMap", "esri/arcgis/utils", "dojo/parser", "dijit/form/RadioButton", "dijit/form/ComboBox", "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dijit/layout/AccordionContainer", "dojo/domReady!"], 
  function(Map,IdentifyTask,
          IdentifyParameters,
          InfoTemplate,Geoprocessor,Dialog,PictureFillSymbol, CartographicLineSymbol, GeometryService, Editor, TemplatePicker, config,Bookmarks,ItemFileReadStore,
          DataGrid,QueryTask,declare, Draw, Graphic, graphicsUtils, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, PrintTemplate,
    Geoprocessor, FeatureSet, LinearUnit, Print,
    ready, parser, on, Color, array,Map, PrintTemplate, Print, TooltipDialog, dijitPopup, Query, Grid, Selection, Draw, array, TextSymbol, Font, on, Graphic, BasemapGallery, Geocoder, SimpleMarkerSymbol, Locator, Directions, Legend, Scalebar, FeatureLayer, ArcGISDynamicMapServiceLayer, Extent, dom, parser, Color, OverviewMap, arcgisUtils, parser) {
	parser.parse();
	var extentInitial = new Extent({
		"xmin":-967051.901284916,"ymin":4536802.217906146,"xmax":66376.72113039228,"ymax":5170312.308333519,"spatialReference":{"wkid":102100,"latestWkid":3857
		}
		
	});
//-------------------Proxy-------------
config.defaults.io.proxyUrl = "http://localhost/proxy/proxy.ashx";
 
 // Creamos el objeto diálogo el cual mostrara el gráfico
	   myDialog = new Dialog({
			title: "Perfil topográfico",
			content: "Test content.",
			style: "width: 900px"
		});

	//------------------Creación del mapa--------------------------
  //------------------Map Creation-------------------------------

	map = new Map("map", {
		basemap : "topo",
		extent : extentInitial
	});
	
	
	//----------------------Cuenca visual-------------------------------
  //----------------------Viewshed------------------------------------
	 gpViewshed = new Geoprocessor("http://localhost:6080/arcgis/rest/services/proyecto/CuencaVisualsincrona/GPServer/CuencaVisual");
	//-----------------------Parkings cercanos----------------------------------
  //-----------------------Nearest Parkings-----------------------------------
	gpparkings=new Geoprocessor("http://localhost:6080/arcgis/rest/services/proyecto/ParkingsCercanossinc/GPServer/ParkingsCercanos");
	
	//--------------------- lineSymbol usada para poder dibujar la linea sobre el mapa -------------------
  //--------------------- lineSymbol used to draw a line on the map ------------------------------------
        var lineSymbol = new CartographicLineSymbol(
          CartographicLineSymbol.STYLE_SOLID,
          new Color([255,0,0]), 10, 
          CartographicLineSymbol.CAP_ROUND,
          CartographicLineSymbol.JOIN_MITER, 5
        );
        
    	
        //cuando acabamos de dibujar salta este metodo para mostar la linea pintada y para la creación de la línea
        //when done drawing this method pops up to display the line and create the line
        function addGraphic(evt) {
          //deactivate the toolbar and clear existing graphics 
          tb2.deactivate(); 
          map.enableMapNavigation();

          // figure out which symbol to use
           var symbol;
          if ( evt.geometry.type === "point" || evt.geometry.type === "multipoint") {
            symbol = markerSymbol;
          } else if ( evt.geometry.type === "line" || evt.geometry.type === "polyline") {
            symbol = lineSymbol;
          }
          else {
            symbol = fillSymbol;
          }
		  // Agregamos la línea al mapa
      // Add the line to the map
		  map.graphics.clear();
          map.graphics.add(new Graphic(evt.geometry, symbol));
        }
        
     
        
	//--------------------Capa editable---------------------------------
  //--------------------Editable layer--------------------------------
	
    // Listen for the editable layers to finish loading
   map.on("layers-add-result", initEditor);
	on(dojo.byId("editar"),"click",cargaeditar);
 // add the editable layers to the map
 function cargaeditar(){  var puntosEdicion = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/edicion_usuarios/FeatureServer/0", {
      outFields : ['*']
    });
    map.addLayers([puntosEdicion]);
    var boton= document.getElementById("editar");
    boton.style.display="none";
    }
    
    map.resize();
      map.reposition();
     function initEditor(results) {
   //map.addLayers([puntosEdicion]);
      // Map the event results into an array of layerInfo objects
      
      var layerInfoedicion = array.map(results.layers, function(result) {
        return {
          featureLayer : result.layer
        };
      });

      /*
       * Step: Map the event results into an array of Layer objects
       */
      var layeredicion = array.map(results.layers, function(result) {
        return result.layer;
      });

      /*
       * Step: Add a custom TemplatePicker widget
       */
     var tpCustom = new TemplatePicker({
        featureLayers : layeredicion,
        columns : 1
      }, "divLeft");
      tpCustom.startup();

      /*
       * Step: Prepare the Editor widget settings
       */
      var editorSettings = {
        map : map,
        geometryService : new GeometryService("http://localhost:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer"),
        layerInfos : layerInfoedicion,
        toolbarVisible : false,
        templatePicker : tpCustom,
        createOptions : {
          polygonDrawTools : [Editor.CREATE_TOOL_FREEHAND_POLYGON, Editor.CREATE_TOOL_RECTANGLE, Editor.CREATE_TOOL_TRIANGLE, Editor.CREATE_TOOL_CIRCLE]
        },
        toolbarOptions : {
          reshapeVisible : true
        },
        enableUndoRedo : true,
        maxUndoRedoOperations : 20
      };

      /*
       * Step: Build the Editor constructor's first parameter
       */
      var editorParams = {
        settings : editorSettings
      };

      /*
       * Step: Construct the Editor widget
       */
      widgetEditor = new Editor(editorParams, "divTop");
      widgetEditor.startup();

    };
    
    
	//------------------Marcadores-------------------------------------
  //------------------Bookmarks--------------------------------------
	var bookmarks_list = [{
          "extent": {
            "spatialReference": {
                "wkid": 102100
            },
            "xmin":-688133.1850723802,"ymin":4832307.769256518,"xmax":-623543.8961714933,"ymax":4856691.181279457
             },
          "name": "Monfragüe"
          }];
          // Create the bookmark widget
        bookmarks = new esri.dijit.Bookmarks({
          map: map, 
          bookmarks: bookmarks_list
        }, dojo.byId('bookmarks')); 

	//----------------Mapas base de ArcGIS.com incluyendo mapas de bing-------------------------
  //----------------ArcGIS Online Basemaps including bing maps--------------------------------
	var basemapGallery = new BasemapGallery({
		showArcGISBasemaps : true,
		map : map
	}, "basemapGallery");
	basemapGallery.startup();

	//----------------Imprimir---------------------
  //----------------Print------------------------
 // create an array of JSON objects that will be used to create print templates
    var myLayouts = [{
      "name" : "Letter ANSI A Landscape",
      "label" : "Landscape (PDF)",
      "format" : "pdf",
      "layout" : "Letter ANSI A Landscape",
      "options" : {
      	"authorText": "Realizado por:  Juan David Franco Caballero",
              "copyrightText": "Red Extremeña de Desarollo Extremeño ©",
        "legendLayers" : [], // empty array means no legend
        "scaleBarUnit" : "Miles",
        "titleText" : "Landscape PDF"
      }
    }, {
      "name" : "Letter ANSI A Portrait",
      "label" : "Portrait (JPG)",
      "format" : "jpg",
      "layout" : "Letter ANSI A Portrait",
      "options" : {
      	"authorText": "Realizado por:  Juan David Franco Caballero",
              "copyrightText": "Red Extremeña de Desarollo Extremeño ©",
        "legendLayers" : [],
        "scaleBarUnit" : "Miles",
        "titleText" : "Portrait JPG"
      }
    }, {
      "name" : "A3 Landscape",
      "label" : "A3 Landscape (JPG)",
      "format" : "jpg",
      "layout" : "A3 Landscape",
      "options" : {
      	"authorText": "Realizado por:  Juan David Franco Caballero",
              "copyrightText": "Red Extremeña de Desarollo Extremeño ©",
        "legendLayers" : [],
        "scaleBarUnit" : "Miles",
        "titleText" : "Portrait JPG"
      }
    }, {
      "name" : "A3 Landscape",
      "label" : "A3 Landscape (PDF)",
      "format" : "pdf",
      "layout" : "A3 Landscape",
      "options" : {
      	"authorText": "Realizado por:  Juan David Franco Caballero",
              "copyrightText": "Red Extremeña de Desarollo Extremeño ©",
        "legendLayers" : [],
        "scaleBarUnit" : "Miles",
        "titleText" : "Portrait JPG"
      }
    }, {
      "name" : "A4 Portrait",
      "label" : "A4 Portrait (PDF)",
      "format" : "pdf",
      "layout" : "A4 Portrait",
      "options" : {
      	"authorText": "Realizado por:  Juan David Franco Caballero",
              "copyrightText": "Red Extremeña de Desarollo Extremeño ©",
        "legendLayers" : [],
        "scaleBarUnit" : "Miles",
        "titleText" : "Portrait JPG"
      }
    }, {
      "name" : "A4 Landscape",
      "label" : "A4 Landscape (PDF)",
      "format" : "pdf",
      "layout" : "A4 Landscape",
      "options" : {
      	"authorText": "Realizado por:  Juan David Franco Caballero",
              "copyrightText": "Red Extremeña de Desarollo Extremeño ©",
        "legendLayers" : [],
        "scaleBarUnit" : "Miles",
        "titleText" : "Portrait JPG"
      }
    }];

    // create the print templates, could also use dojo.map
    var myTemplates = [];
    dojo.forEach(myLayouts, function(lo) {
      var t = new PrintTemplate();
      t.layout = lo.name;
      t.label = lo.label;
      t.format = lo.format;
      t.layout = lo.layout;
      t.layoutOptions = lo.options;
      myTemplates.push(t);
    });
    
    
 //------------------Ejecutar la carga de capas, la leyenda e impresión-------------------------------
 //------------------Execute layers and legend load and print-----------------------------------------
  
 map.on("load",function() {
       gpViewshed.outSpatialReference = map.spatialReference;
       gpparkings.outSpatialReference = map.spatialReference;
         var widgetPrint = new Print({
        map : map,
        url : "http://localhost:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
      templates : myTemplates
      }, divPrint);
      
      widgetPrint.startup();
      var dijitLegend = new Legend({
        map : map,
        
      }, "divLegend");
      dijitLegend.startup();
      
      //-----------------cargar agol-----------------------
      //-----------------Load ArcGIS online map------------
       cargaMapaWeb('0587e1992bfa47af992e8d10235f890a');  
       
         tb2 = new Draw(map);
		  // Cuando acabemos de dibujar llamamos al la función addGraphic
      //Call AddGraphic function when done drawing
          tb2.on("draw-end", addGraphic);
          // event delegation so a click handler is not
          // needed for each individual button
          on(dom.byId("Polyline"), "click", function(evt) {
            if ( evt.target.id === "info" ) {
              return;
            }
            var tool = evt.target.id.toLowerCase();
			//Si presionamos sobre algo que no es el boton polyline no hacemos nada
      //Do nothing if clicking on anything but polyline button
				if(tool=="polyline"){
				map.disableMapNavigation();
				tb2.activate(tool);
			}
          });
       
          });

     
     
    
	//--------------------Localizador-------------------
  //--------------------Locator-----------------------
	var taskLocator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
	on(dom.byId("btnLocate"), "click", doAddressToLocations);
	taskLocator.on("address-to-locations-complete", showResults);
	function doAddressToLocations() {
		map.graphics.clear();

		/*
		 * Step: Complete the Locator input parameters
		 */
		var objAddress = {
			"SingleLine" : dom.byId("taAddress").value
		}
		var params = {
			address : objAddress,
			outFields : ["Loc_name"]
		}

		/*
		 * Step: Execute the task
		 */
		taskLocator.addressToLocations(params);
	}

	function showResults(candidates) {
		// Define the symbology used to display the results
		var symbolMarker = new SimpleMarkerSymbol();
		symbolMarker.setStyle(SimpleMarkerSymbol.STYLE_CIRCLE);
		symbolMarker.setColor(new Color([255, 0, 0, 0.75]));
		var font = new Font("14pt", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, "Helvetica");

		// loop through the array of AddressCandidate objects
		var geometryLocation;
		array.every(candidates.addresses, function(candidate) {

			// if the candidate was a good match
			if (candidate.score > 80) {

				// retrieve attribute info from the candidate
				var attributesCandidate = {
					address : candidate.address,
					score : candidate.score,
					locatorName : candidate.attributes.Loc_name
				};

				/*
				 * Step: Retrieve the result's geometry
				 */
				geometryLocation = candidate.location;
				/*
				 * Step: Display the geocoded location on the map
				 */
				var graphicResult = new Graphic(geometryLocation, symbolMarker, attributesCandidate);
				map.graphics.add(graphicResult);
				// display the candidate's address as text
				var sAddress = candidate.address;
				var textSymbol = new TextSymbol(sAddress, font, new Color("#FF0000"));
				textSymbol.setOffset(0, -22);
				map.graphics.add(new Graphic(geometryLocation, textSymbol));

				// exit the loop after displaying the first good match
				return false;
			}
		});

		// Center and zoom the map on the result
		if (geometryLocation !== undefined) {
			map.centerAndZoom(geometryLocation, 15);
		}
	}
	  

	//------------Direcciones---------------------------------
  //------------Directions----------------------------------
	var dijitDirections = new Directions({
		map : map,
		routeTaskUrl : "http://localhost:6080/arcgis/rest/services/proyecto/Network/NAServer/Route"
	}, "divDirections");
	dijitDirections.startup();
	//------------------Añadir capas---------------------------------
	var capas = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/0", {
		opacity : 0.9
	});
	capas2 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/1", {
		opacity : 0.9,
		id: "capaFeature"
	});
	var capas3 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/2", {
		opacity : 0.9
	});
	 capas4 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/3", {
		opacity : 0.9,
	});
	capas5 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/4", {
		opacity : 0.9,
		id: "capaFeature2"
	});
	var capas6 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/5", {
		opacity : 0.9
	});
	var capas7 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/6", {
		opacity : 0.9
	});
	var capas8 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/7", {
		opacity : 0.9
	});
	var capas9 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/8", {
		opacity : 0.9
	});
	var capas10 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/9", {
		opacity : 0.7
	});
	var capas11 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/10", {
		opacity : 0.9
	});
		
	map.addLayer(capas10);
	map.addLayer(capas8);
	map.addLayer(capas9);
	map.addLayer(capas6);
	map.addLayer(capas7);
	map.addLayer(capas5);
	map.addLayer(capas);
	map.addLayer(capas2);
	map.addLayer(capas4);
map.addLayer(capas3);


//---------------------Identificar----------------------------
//---------------------Identify-------------------------------   
    var identifyTask, identifyParams;
	 //map.on("load", initFunctionality);
	 on(dojo.byId("identify"),"click",initFunctionality);
 
function initFunctionality () {
	
	if (contador==false){
		contador=true;}
		else{contador=false;}
	 	map.on("click", doIdentify);
			
              identifyTask = new IdentifyTask("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer");

              identifyParams = new IdentifyParameters();
              identifyParams.tolerance = 3;
              identifyParams.returnGeometry = true;
              identifyParams.layerIds = [0,1,2,3,4,5,6,8,9,10];
              identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
              identifyParams.width = map.width;
              identifyParams.height = map.height;

              map.infoWindow.resize(415, 200);
              
              /*symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                  new Color([255, 0, 0]), 2),
                new Color([255, 255, 0, 0.25]));*/
                  symbol = new SimpleMarkerSymbol({
            "color": [255,255,255,0],
            "size": 3,
            "angle": -30,
            "xoffset": 0,
            "yoffset": 0,
            "type": "esriSMS",
            "style": "esriSMSCircle",
            "outline": {
              "color": [0,0,0,255],
              "width": 3,
              "type": "esriSLS",
              "style": "esriSLSSolid"
            }
        });
          
        }
          
function doIdentify (event) {
	if(contador==true){
            map.graphics.clear();
            identifyParams.geometry = event.mapPoint;
            identifyParams.mapExtent = map.extent;
            identifyTask.execute(identifyParams, function (idResults) {
              addToMap(idResults, event);
              
            });
       }
       } 
 
function addToMap (idResults, event) {
	

            if(idResults.length>0){
            	for (var i=0;i<idResults.length;i++){
              var layerName = idResults[i].layerName;
              if (layerName === 'RENPEX_2012_ED50H30') {
                var features=[];
               
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Zonas Protegidas",
                      "<b>Nombre: </b>${NOMBRE_ENP}<br/><b>Hectares: </b>${Hectares}<br/><b>ENP : </b>${ENP}<br/><b>Area: </b>${Shape_Area}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,200);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }
             else if (layerName === 'RN2000_LIC_ENERO_2005') {
                var features=[];
               
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Lugar de interés comunitario",
                      "<b>Nombre: </b>${NOMBRE}<br/><b>SITECODE: </b>${SITECODE}<br/><b>Area: </b>${Shape_Area}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,200);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }else if (layerName === 'RN2000_ZEPA_ENERO_2005') {
                var features=[];
               
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("ZEPAs",
                      "<b>Nombre: </b>${NOMBRE}<br/><b>SITECODE: </b>${SITECODE}<br/><b>Area: </b>${Shape_Area}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,200);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }else if (layerName === 'alojamientos') {
                var features=[];
               
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Alojamientos",
                      "<b>Nombre: </b>${rec_Nombre}<br/><b>Municipio: </b>${Mun_INE}<br/><b>tipo: </b>${sub1_Nombr}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,200);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }else if (layerName === 'rec_complementarios') {
                var features=[];
               
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Recursos Complementarios",
                      "<b>Nombre: </b>${rec_Nombre}<br/><b>Municipio: </b>${Mun_INE}<br/><b>tipo: </b>${sub1_Nombr}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,200);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }else if (layerName === 'Parkings') {
                var features=[];
               
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Parkings}",
                      "<b>Nombre: </b>${rec_Nombre}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,200);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }else if (layerName === 'rec_turisticos') {
                var features=[];
               
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Recursos Turísticos",
                      "<b>Nombre: </b>${rec_Nombre}<br/><b>Municipio: </b>${Mun_INE}<br/><b>tipo: </b>${sub1_Nombr}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,200);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }else if (layerName === 'Observatorios') {
                var features=[];
               
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Observatorios",
                      "<b>Nombre: </b>${rec_Nombre}<br/><b>Municipio: </b>${Mun_INE}<br/><b>Aves visibles: </b>${Aves}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,200);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }else if (layerName === 'TRAMO_VIAL') {
                var features=[];
               
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Vías",
                      "<b>Tipo: </b>${TIPO_VIA}<br/><b>Nombre: </b>${NOM_VIA}<br/><b>Velocidad: </b>${Velocidad}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,200);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }else if (layerName === 'rutas') {
                var features=[];
               
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Rutas",
                      "<b>Nombre: </b>${TRACKNAME}<br/><b>Longitud: </b>${Shape_Length}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,200);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }
              }
            }

          
         }
//-------------------------------Identify--------------------------------------------
   //  map.on("load",initFunctionality);
        /* function initFunctionality () {
              map.on("click", doIdentify);

              identifyTask = new IdentifyTask("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/8");

              identifyParams = new IdentifyParameters();
              identifyParams.tolerance = 3;
              identifyParams.returnGeometry = true;
              identifyParams.layerIds = [2];
              identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
              identifyParams.width = map.width;
              identifyParams.height = map.height;

              map.infoWindow.resize(415, 200);
              
              symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                  new Color([255, 0, 0]), 2),
                new Color([255, 255, 0, 0.25]));
          }*/
           /* function doIdentify (event) {
          	
            map.graphics.clear();
            identifyParams.geometry = event.mapPoint;
            identifyParams.mapExtent = map.extent;
            identifyTask.execute(identifyParams, function (idResults) {
              addToMap(idResults, event);
            });
          }*/

         /* function addToMap (idResults, event) {
          	    var layerName = idResults[0].layerName;
              if (layerName == 'RENPEX_2012_ED50H30') {
                var features=[];
               alert("Hola");
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Nombre: ${NOMBRE_ENP}",
                      "<b>Hectares: </b>${Hectares}<br/><b>ENP : </b>${ENP }<br/><b>Area: </b>${Shape_Area}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,500);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              } */
           /* if(idResults.length>0){
              var layerName = idResults[0].layerName;
              if (layerName == 'RENPEX_2012_ED50H30') {
                var features=[];
               alert("Hola");
               for (var i=0;i<idResults.length;i++){
                  var plantillaContenido = new InfoTemplate("Nombre: ${NOMBRE_ENP}",
                      "<b>Hectares: </b>${Hectares}<br/><b>ENP : </b>${ENP }<br/><b>Area: </b>${Shape_Area}<br/>");
                  idResults[i].feature.setInfoTemplate(plantillaContenido);
                  features.push(idResults[i].feature);
                }
                map.infoWindow.setFeatures(features);
                map.infoWindow.resize(150,500);
                map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));

              }
            }

          }*/

        


	//------------------------------Barra de Escala------------------------
  //------------------------------Scale Bar------------------------------
	var dijiSscalebar = new Scalebar({
		map : map,
		attachTo : "bottom-left",
		scalebarUnit : "metric"
	});
	//-----------------------Mapa de situacion------------------------
  //-----------------------Overview map-----------------------------
	var overviewMapDijit = new OverviewMap({
		map : map,
		attachTo : "bottom-right",
		visible : true,
		width : 150
	});
	overviewMapDijit.startup();
});
function cuenca(){
	require([
  "esri/map", 
  "esri/toolbars/draw",
  "esri/graphic",
  "esri/graphicsUtils",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/tasks/PrintTemplate",
  
  "esri/tasks/Geoprocessor",
  "esri/tasks/FeatureSet",
  "esri/tasks/LinearUnit",
  "esri/dijit/Print",
  
  "dojo/ready", 
  "dojo/parser", 
  "dojo/on",
  "dojo/_base/Color",
  "dojo/_base/array"], 
  function(
    Map, Draw, Graphic, graphicsUtils, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, PrintTemplate,
    Geoprocessor, FeatureSet, LinearUnit, Print,
    ready, parser, on, Color, array
    ){
    	   // Collect the input observation point
    var tbDraw = new Draw(map);
    tbDraw.on("draw-end", calculateViewshed);
    tbDraw.activate(Draw.POINT);
    
     function calculateViewshed(evt) {

      // clear the graphics layer
      map.graphics.clear();

      // marker symbol for drawing viewpoint
      var smsViewpoint = new SimpleMarkerSymbol();
      smsViewpoint.setSize(12);
      smsViewpoint.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255]), 1));
      smsViewpoint.setColor(new Color([0, 0, 0]));

      // add viewpoint to the map
      var graphicViewpoint = new Graphic(evt.geometry, smsViewpoint);
      map.graphics.add(graphicViewpoint);

      /*
       * Step: Prepare the first input parameter
       */
      var fsInputPoint = new FeatureSet();
      fsInputPoint.features.push(graphicViewpoint);

      /*
       * Step: Prepare the second input parameter
       */
      var luDistance = new LinearUnit();
      luDistance.distance = 5;
      luDistance.units = "esriMiles";

      /*
       * Step: Build the input parameters into a JSON-formatted object
       */
      var gpParams = {
        "Input_Observation_Point" : fsInputPoint,
        "Viewshed_Distance" : luDistance
      };

      /*
       * Step: Wire and execute the Geoprocessor
       */
      gpViewshed.on("execute-complete", displayViewshed);
      gpViewshed.execute(gpParams);

    }
    
        function displayViewshed(results, messages) {

      // polygon symbol for drawing results
      var sfsResultPolygon = new SimpleFillSymbol();
      sfsResultPolygon.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1));
      sfsResultPolygon.setColor(new Color([255, 255, 0, 0.5]));

      /*
       * Step: Extract the array of features from the results
       */
      var pvResult = results.results[0];
      var gpFeatureRecordSetLayer = pvResult.value;
      var arrayFeatures = gpFeatureRecordSetLayer.features;

      // loop through results
      array.forEach(arrayFeatures, function(feature) {

        /*
         * Step: Symbolize and add each graphic to the map's graphics layer
         */
        feature.setSymbol(sfsResultPolygon);
        map.graphics.add(feature);

      });

      // update the map extent
      var extentViewshed = graphicsUtils.graphicsExtent(map.graphics.graphics);
      map.setExtent(extentViewshed, true);
      tbDraw.deactivate();
    }
    });
}
//Función que llama a la tarea de geoprocesamiento
//Function calling geoprocessing taks
	  function llamarGP(){
		var gp;
		require(["esri/tasks/Geoprocessor","esri/tasks/FeatureSet","esri/graphic","dijit/Dialog","dojo/_base/array"], function(
			Geoprocessor,FeatureSet,Graphic,array){
				//Obtenemos siempre la primera linea dibujada
        //Always get the first drawn line
				var graphic= map.graphics.graphics[0];
				gp = new Geoprocessor("http://localhost:6080/arcgis/rest/services/proyecto/topoPerfil/GPServer/TopoPerfil");
				var features= [];
				features.push(graphic);
				var featureSet = new FeatureSet();
				featureSet.features = features;
				var params = {
					"rutas": featureSet
				};
				//Llamamos a la tarea
        //call the task
				gp.submitJob(params, ObtenerTabla);
				
				var ele= document.getElementById("imagen");
					ele.style="visibility:visible";
	
					var eleTexto= document.getElementById("texto");
					eleTexto.style="visibility:visible";
				
				//Si la ejecución a sido correcta obtenemos la tabla generada por la tarea de GP
        //If executes successfully, get table generated by geoprocessing task
				function ObtenerTabla(jobInfo){
					if(jobInfo.jobStatus !== "esriJobFailed"){
						gp.getResultData(jobInfo.jobId,"StackProfile", descargarTabla);
					}
				}
				
				//Obtenemos la tabla y procedemos a crear el grafico
        //Get table and proceed to create graphic
				function descargarTabla(outputFile){
					//Si devuelve 0 es que posiblemente devuelva mas de 5000 entidades que es el maximo de nuestro GP
          //If returns 0. it's posibly returning more than 5,000 entities which is our geoprocessing limit
					record = outputFile.value.features;  
					
					var dat = new Array();
					dat.push(['Distancia', 'Altura']);
					 // loop through results
					dojo.forEach(record, function(feature) {
						dat.push([feature.attributes.FIRST_DIST,feature.attributes.FIRST_Z]);
					});
					var data = google.visualization.arrayToDataTable(dat);

					var options = {
					  title: 'Perfil topográfico',
					  curveType: 'function',
					};
					// Creo un div dinamicamente y meto el gráfico en el
          //Create a div dynamically and get the graphic in it
					var div = document.createElement("div");
					div.style.width = "900px";
					div.style.height = "500px";
					document.body.appendChild(div);
					
					var chart = new google.visualization.LineChart(div);
					chart.draw(data, options);
					myDialog.set("content",div);
					myDialog.show();
		
					var ele= document.getElementById("imagen");
					ele.style="visibility:hidden";
	
					var eleTexto= document.getElementById("texto");
					eleTexto.style="visibility:hidden";
	
				}

			});
	  }
	  
	  //--------------------------direcciones a mano--------------
    //--------------------------inpunt directions---------------
	  require([
        "esri/urlUtils",
        "esri/config",
        "esri/map",
        "esri/graphic",            
        "esri/tasks/RouteTask",            
        "esri/tasks/RouteParameters",
		"esri/layers/FeatureLayer",

        "esri/tasks/FeatureSet",            
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",          

        "dojo/_base/Color",
        "dojo/_base/array",
        "dojo/on",
        "dojo/dom",
        "dijit/registry",

        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/form/HorizontalSlider",
        "dijit/form/HorizontalRuleLabels"
      ], function (
        urlUtils, esriConfig, Map, Graphic, RouteTask, RouteParameters, FeatureLayer,
        FeatureSet, SimpleMarkerSymbol, SimpleLineSymbol,           
        Color, array, on, dom, registry
      ) {
        var routeTask, routeParams, routes = [];
        var stopSymbol, barrierSymbol, routeSymbols;
        var mapOnClick_addStops_connect, mapOnClick_addBarriers_connect;

        /*urlUtils.addProxyRule({
          urlPrefix: "http://localhost/PFM/",  
          proxyUrl: "proxy/proxy.ashx"
        });
		*/
		urlUtils.addProxyRule({
          urlPrefix: "route.arcgis.com",  
          proxyUrl: "/sproxy"
        });
        /*
        map = new Map("map", {
          basemap: "streets",
          center: [-4.83, 43.19],
          zoom: 15
        });
		*/
		
		var feat = new FeatureLayer("http://localhost:6080/arcgis/rest/services/proyecto/Extremadura/MapServer/5",
		{
			mode: FeatureLayer.MODE_ONDEMAND});
			//map.addLayer(feat);  //Esto es para ver la capa de rutas en el mapa - this displays routes layer on the map

        routeTask = new RouteTask("http://localhost:6080/arcgis/rest/services/proyecto/Network/NAServer/Route");
        routeParams = new RouteParameters();
        routeParams.stops = new FeatureSet();
        routeParams.barriers = new FeatureSet();
        routeParams.outSpatialReference = {"wkid":102100};
        
        routeTask.on("solve-complete", showRoute);
        routeTask.on("error", errorHandler);
                
        stopSymbol = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_CROSS).setSize(15);
        stopSymbol.outline.setWidth(3);

        barrierSymbol = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_X).setSize(10);
        barrierSymbol.outline.setWidth(3).setColor(new Color([255,0,0]));

        routeSymbols = {
          "Route 1": new SimpleLineSymbol().setColor(new Color([0,0,255,0.5])).setWidth(5),
          "Route 2": new SimpleLineSymbol().setColor(new Color([0,255,0,0.5])).setWidth(5),
          "Route 3": new SimpleLineSymbol().setColor(new Color([255,0,255,0.5])).setWidth(5),
		  "Route 4": new SimpleLineSymbol().setColor(new Color([255,0,163,0.5])).setWidth(5)
        };
                        
        //button click event listeners can't be added directly in HTML when the code is wrapped in an AMD callback
        on(dom.byId("addStopsBtn"), "click", addStops);
        on(dom.byId("clearStopsBtn"), "click", clearStops);
        on(dom.byId("addBarriersBtn"), "click", addBarriers);
        on(dom.byId("clearBarriersBtn"), "click", clearBarriers);
        on(dom.byId("solveRoutesBtn"), "click", solveRoute);
        on(dom.byId("clearRoutesBtn"), "click", clearRoutes);        
      
        //Begins listening for click events to add stops
        function addStops() {
          removeEventHandlers();
          mapOnClick_addStops_connect = map.on("click", addStop);
        }

        //Clears all stops
        function clearStops() {
          removeEventHandlers();
          for (var i=routeParams.stops.features.length-1; i>=0; i--) {
            map.graphics.remove(routeParams.stops.features.splice(i, 1)[0]);
          }
        }

        //Adds a stop. The stop is associated with the route currently displayed in the dropdown
        function addStop(evt) {
          routeParams.stops.features.push(
            map.graphics.add(
              new esri.Graphic(
                evt.mapPoint,
                stopSymbol,
                { RouteName:dom.byId("routeName").value }
              )
            )
          );
        }

        //Begins listening for click events to add barriers
        function addBarriers() {
          removeEventHandlers();
          mapOnClick_addBarriers_connect = on(map, "click", addBarrier);
        }

        //Clears all barriers
        function clearBarriers() {
          removeEventHandlers();
          for (var i=routeParams.barriers.features.length-1; i>=0; i--) {
            map.graphics.remove(routeParams.barriers.features.splice(i, 1)[0]);
          }
        }

        //Adds a barrier
        function addBarrier(evt) {
          routeParams.barriers.features.push(
            map.graphics.add(
              new esri.Graphic(
                evt.mapPoint,
                barrierSymbol
              )
            )
          );
        }

        //Stops listening for click events to add barriers and stops (if they've already been wired)
        function removeEventHandlers() {        
          if (mapOnClick_addStops_connect) {
            mapOnClick_addStops_connect.remove();
          }
          if (mapOnClick_addBarriers_connect) {
            mapOnClick_addBarriers_connect.remove();
          }
        }

        //Solves the routes. Any errors will trigger the errorHandler function.
        function solveRoute() {
          removeEventHandlers();
          routeTask.solve(routeParams);
        }

        //Clears all routes
        function clearRoutes() {
          for (var i=routes.length-1; i>=0; i--) {
            map.graphics.remove(routes.splice(i, 1)[0]);
          }
          routes = [];
        }

        //Draws the resulting routes on the map
        function showRoute(evt) {
          clearRoutes();

          array.forEach(evt.result.routeResults, function(routeResult, i) {
            routes.push(
              map.graphics.add(
                routeResult.route.setSymbol(routeSymbols[routeResult.routeName])
              )
            );
          });

          var msgs = ["Server messages:"];
          array.forEach(evt.result.messages, function(message) {
            msgs.push(message.type + " : " + message.description);
          });
          if (msgs.length > 1) {
            alert(msgs.join("\n - "));
          }
        }

        //Reports any errors that occurred during the solve
        function errorHandler(err) {
          alert("An error occured\n" + err.message + "\n" + err.details.join("\n"));
        }
      });



//--------------------------Parkings cercanos--------------------------------------
//--------------------------Nearest Parkings---------------------------------------
function parkings(){
	require([
  "esri/map", 
  "esri/toolbars/draw",
  "esri/graphic",
  "esri/graphicsUtils",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/tasks/PrintTemplate",
  
  "esri/tasks/Geoprocessor",
  "esri/tasks/FeatureSet",
  "esri/tasks/LinearUnit",
  "esri/dijit/Print",
  
  "dojo/ready", 
  "dojo/parser", 
  "dojo/on",
  "dojo/_base/Color",
  "dojo/_base/array"], 
  function(
    Map, Draw, Graphic, graphicsUtils, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, PrintTemplate,
    Geoprocessor, FeatureSet, LinearUnit, Print,
    ready, parser, on, Color, array
    ){
    	   // Collect the input observation point
    var tbDrawp = new Draw(map);
    tbDrawp.on("draw-end", calculatep);
    tbDrawp.activate(Draw.POINT);
    
     function calculatep(evt) {

      // clear the graphics layer
      map.graphics.clear();

      // marker symbol for drawing viewpoint
      var smsobspoint = new SimpleMarkerSymbol();
      smsobspoint.setSize(12);
      smsobspoint.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255]), 1));
      smsobspoint.setColor(new Color([255, 0, 0]));

      // add viewpoint to the map
      var graphicobspoint = new Graphic(evt.geometry, smsobspoint);
      map.graphics.add(graphicobspoint);

      /*
       * Step: Prepare the first input parameter
       */
      var fsInputPoint2 = new FeatureSet();
      fsInputPoint2.features.push(graphicobspoint);

      /*
       * Step: Prepare the second input parameter
       */
      var luDistance2 = new LinearUnit();
      luDistance2.distance = 3;
      luDistance2.units = "esriKilometers";

      /*
       * Step: Build the input parameters into a JSON-formatted object
       */
      var gpParamsp = {
        "Observatorios" : fsInputPoint2,
        "Distancia" : luDistance2
      };

      /*
       * Step: Wire and execute the Geoprocessor
       */
      gpparkings.on("execute-complete", displayparkings);
      gpparkings.execute(gpParamsp);

    }
    
        function displayparkings(results, messages) {

      // point symbol for drawing results
     
       var parkpoint = new SimpleMarkerSymbol();
      parkpoint.setSize(15);
      parkpoint.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1));
      parkpoint.setColor(new Color([255, 255, 0]));

      /*
       * Step: Extract the array of features from the results
       */
      var pvResult = results.results[0];
      var gpFeatureRecordSetLayer = pvResult.value;
      var arrayFeatures = gpFeatureRecordSetLayer.features;

      // loop through results
      array.forEach(arrayFeatures, function(feature) {

        /*
         * Step: Symbolize and add each graphic to the map's graphics layer
         */
        feature.setSymbol(parkpoint);
        map.graphics.add(feature);

      });

      // update the map extent
      var extentViewshed = graphicsUtils.graphicsExtent(map.graphics.graphics);
      map.setExtent(extentViewshed, true);
      tbDrawp.deactivate();
    }
    });
}