  var INK = "#12343b", AMBER = "#b06a17";
  // Each day: ordered points [name, lat, lng, isBase]
  var DAYS = {
    "map-d1": [["The Waldorf Hilton",51.5135,-0.1199,true],["Windsor Castle",51.4839,-0.6044,false]],
    "map-d2": [["The Waldorf Hilton",51.5135,-0.1199,true],["British Museum",51.5194,-0.1270,false],["The National Gallery",51.5089,-0.1283,false]],
    "map-d3": [["The Waldorf Hilton",51.5135,-0.1199,true],["Buckingham Palace",51.5014,-0.1419,false],["King's Cross Station",51.5308,-0.1238,false]],
    "map-1": [["Glengarry Castle Hotel",57.069086,-4.778156,true],["Fort Augustus",57.1448064,-4.6805166,false]],
    "map-2": [["Glengarry Castle Hotel",57.069086,-4.778156,true],["Glencoe",56.6615284,-4.9174463,false],["Glenfinnan Viaduct",56.8762172,-5.4317589,false]],
    "map-3": [["Glengarry Castle Hotel",57.069086,-4.778156,true],["Urquhart Castle",57.3241399,-4.4420013,false],["Culloden",57.4777898,-4.095711,false]],
    "map-4": [["Glengarry Castle Hotel",57.069086,-4.778156,true],["Ben Nevis",56.7968571,-5.0035505,false]],
    "map-5": [["Glengarry Castle Hotel",57.069086,-4.778156,true],["Skye Games, Portree",57.4124,-6.1953,false]],
    "map-6": [["Glengarry Castle Hotel",57.069086,-4.778156,true],["Glenfarclas Distillery",57.4230,-3.3176,false],["Craigellachie Hotel",57.489248,-3.190163,true]],
    "map-7": [["Craigellachie Hotel",57.489248,-3.190163,true],["Speyside Cooperage",57.4825,-3.1811,false],["Walkers Shortbread",57.4703,-3.2256,false]],
    "map-8": [["Craigellachie Hotel",57.489248,-3.190163,true],["Aviemore",57.2005355,-3.8281798,false]],
    "map-9": [["Craigellachie Hotel",57.489248,-3.190163,true],["Balmoral Castle",57.0396646,-3.2292362,false],["Aberdeen Airport",57.203715,-2.200215,false]]
  };

  // Trip Overview: 5 anchor bases in trip order, plus each anchor's day-trip stops ("spokes").
  var ANCHORS = [
    ["The Waldorf Hilton, London",51.5135,-0.1199],
    ["Leeds Marriott Hotel",53.795517,-1.543154],
    ["Glengarry Castle Hotel",57.069086,-4.778156],
    ["Craigellachie Hotel",57.489248,-3.190163],
    ["Hilton Aberdeen TECA",57.185475,-2.193083]
  ];
  var OVERVIEW_SPOKES = {
    0: [["Buckingham Palace",51.5014,-0.1419],["British Museum",51.5194,-0.1270],["The National Gallery",51.5089,-0.1283],["Windsor Castle",51.4839,-0.6044],["King's Cross Station",51.5308,-0.1238]],
    1: [["York",53.9623,-1.0819],["Harrogate",53.9908,-1.5373],["Saltaire",53.8371,-1.7907],["Royal Armouries, Leeds",53.791,-1.524]],
    2: [["Fort Augustus",57.1448064,-4.6805166],["Glencoe",56.6615284,-4.9174463],["Glenfinnan Viaduct",56.8762172,-5.4317589],["Urquhart Castle",57.3241399,-4.4420013],["Culloden",57.4777898,-4.095711],["Ben Nevis",56.7968571,-5.0035505],["Skye Games, Portree",57.4124,-6.1953],["The Three Chimneys, Colbost",57.4435328,-6.6416829]],
    3: [["Glenfarclas Distillery",57.4230,-3.3176],["Speyside Cooperage",57.4825,-3.1811],["Walkers Shortbread",57.4703,-3.2256],["Aviemore",57.2005355,-3.8281798],["Balmoral Castle",57.0396646,-3.2292362]],
    4: [["Aberdeen Airport",57.203715,-2.200215]]
  };

  window.MAPS = window.MAPS || {};
  function buildMap(id, pts){
    var el = document.getElementById(id);
    if(!el) return;
    var map = L.map(el, {scrollWheelZoom:false, attributionControl:false, zoomControl:false});
    window.MAPS[id] = map;
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:16}).addTo(map);
    L.control.zoom({position:"topright"}).addTo(map);
    var latlngs = [];
    pts.forEach(function(p){
      var name=p[0], lat=p[1], lng=p[2], isBase=p[3];
      latlngs.push([lat,lng]);
      L.circleMarker([lat,lng],{
        radius:isBase?7:6,
        color:"#fff", weight:2,
        fillColor:isBase?INK:AMBER, fillOpacity:1
      }).addTo(map).bindTooltip(name,{permanent:true,direction:"right",className:"pin-label",offset:[6,0]});
    });
    L.polyline(latlngs,{color:AMBER,weight:2.5,opacity:.7,dashArray:"5,6"}).addTo(map);
    map.fitBounds(L.latLngBounds(latlngs).pad(0.28));
  }

  function buildOverviewMap(){
    var el = document.getElementById("map-overview");
    if(!el) return;
    var map = L.map(el, {scrollWheelZoom:false, attributionControl:false, zoomControl:false});
    window.MAPS["map-overview"] = map;
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:16}).addTo(map);
    L.control.zoom({position:"topright"}).addTo(map);
    var allPts = [], spine = [];
    ANCHORS.forEach(function(a, i){
      var name=a[0], lat=a[1], lng=a[2];
      spine.push([lat,lng]);
      allPts.push([lat,lng]);
      L.circleMarker([lat,lng],{
        radius:8, color:"#fff", weight:2,
        fillColor:INK, fillOpacity:1
      }).addTo(map).bindTooltip(name,{permanent:true,direction:"right",className:"pin-label",offset:[6,0]});
      (OVERVIEW_SPOKES[i]||[]).forEach(function(s){
        var slat=s[1], slng=s[2];
        allPts.push([slat,slng]);
        L.circleMarker([slat,slng],{
          radius:4, color:"#fff", weight:1.5,
          fillColor:AMBER, fillOpacity:1
        }).addTo(map);
        L.polyline([[lat,lng],[slat,slng]],{color:AMBER,weight:1.5,opacity:.6,dashArray:"2,5"}).addTo(map);
      });
    });
    L.polyline(spine,{color:INK,weight:4,opacity:.85}).addTo(map);
    map.fitBounds(L.latLngBounds(allPts).pad(0.12));
  }

  function initAll(){
    for(var id in DAYS){ buildMap(id, DAYS[id]); }
    buildOverviewMap();
  }
  window.initMaps = function(){ if(window.L){ initAll(); } else { window.addEventListener("load", initAll); } };
