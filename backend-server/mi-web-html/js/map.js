// ── 3D TOGGLE ─────────────────────────────────────────────
var mlMap=null;
var cesiumViewer=null;
var is3D=false;
var KEY_MT='0DTatRu20XxUxdDOgrSh';
var CESIUM_TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMGVhNzVhNi05ZTJhLTQ1NTAtODgwNS0wYTFlYzZlMDc0ODUiLCJpZCI6NDE2MDMxLCJpYXQiOjE3NzU3NTUxMzR9.AKXNjnCwSGwqsCwo7wCvbBQgq3hq21EsP_WRn0K4Ses';

// ── MAP (Leaflet) ────────────────────────────────────────────
var currentMap='carto';
var cartoLayer,satelliteLayer;
var btn3d={textContent:''};
var NODES_ORIG=[];

function initMap(){
  map=L.map('map',{center:[GW.lat,GW.lng],zoom:18,zoomControl:true});

  cartoLayer=L.tileLayer('https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key='+KEY_MT,{
    attribution:'© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="https://www.openstreetmap.org/">OSM</a>',
    maxZoom:20,tileSize:512,zoomOffset:-1
  });
  satelliteLayer=L.tileLayer('https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key='+KEY_MT,{
    attribution:'© <a href="https://www.maptiler.com/">MapTiler</a>',
    maxZoom:20,tileSize:512,zoomOffset:-1
  });
  cartoLayer.addTo(map);

  // Botons gestionats pel menu hamburguesa (btn3d es global)

  // Gateway marker
  gwMarker=L.marker([GW.lat,GW.lng],{
    icon:L.divIcon({className:'',html:'<div class="gw-icon-wrap"><div class="gw-hex-icon"><div class="gw-dot"></div></div></div>',iconSize:[30,30],iconAnchor:[15,15],popupAnchor:[0,-20]}),
    draggable:false,zIndexOffset:1000
  }).addTo(map);
  gwMarker.bindPopup(
    '<div class="popup-title">◈ '+GW.label+' — RAK7289V2</div>'+
    '<div class="popup-row"><span>ID</span><span class="popup-val">ac1f09fffe1c63e1</span></div>'+
    '<div class="popup-row"><span>Estat</span><span class="popup-val" id="gwPopupSt" style="color:#555">○ OFFLINE</span></div>'+
    '<div class="popup-row"><span>Freq.</span><span class="popup-val">868 MHz EU868</span></div>'+
    '<div class="popup-row"><span>Ubicació</span><span class="popup-val">Aula 301 — ITB</span></div>'+
    '<div class="popup-coords">Lat: '+GW.lat.toFixed(6)+' · Lng: '+GW.lng.toFixed(6)+'</div>'
  );
  gwMarker.on('popupopen',function(){
    var el=document.getElementById('gwPopupSt');if(!el)return;
    var on=document.getElementById('csGwSt').textContent.includes('ONLINE');
    el.textContent=on?'● ONLINE':'○ OFFLINE';
    el.style.color=on?'var(--green)':'#555';
  });

  [{r:15000,color:'#e040fb',w:2,dash:'12 6',fo:.025},{r:10000,color:'#ce93d8',w:1.5,dash:'8 8',fo:0},
   {r:7500,color:'#ce93d8',w:1.2,dash:'6 8',fo:0},{r:5000,color:'#b39ddb',w:1,dash:'5 7',fo:0},
   {r:2000,color:'#b39ddb',w:1.5,dash:'4 5',fo:.02}].forEach(function(ring){
    L.circle([GW.lat,GW.lng],{radius:ring.r,color:ring.color,weight:ring.w,dashArray:ring.dash,
      fillColor:ring.color,fillOpacity:ring.fo,opacity:.6}).addTo(map);
  });

  function badge(km,clr){
    return '<div style="display:inline-flex;align-items:center;gap:5px;background:rgba(2,12,16,.9);border:1px solid '+clr+';padding:2px 8px 2px 6px;">'+
      '<div style="width:5px;height:5px;border-radius:50%;background:'+clr+';"></div>'+
      '<span style="font-family:Share Tech Mono,monospace;font-size:9px;font-weight:bold;color:'+clr+';letter-spacing:.18em;white-space:nowrap;">'+km+'</span></div>';
  }
  [[GW.lat+.1348,GW.lng+.005,'15 KM MAX','#e040fb'],[GW.lat+.0899,GW.lng+.005,'10 KM','#ce93d8'],
   [GW.lat+.0674,GW.lng+.005,'7.5 KM','#ce93d8'],[GW.lat+.0449,GW.lng+.005,'5 KM','#b39ddb'],
   [GW.lat+.018,GW.lng+.005,'2 KM','#b39ddb']].forEach(function(item){
    L.marker([item[0],item[1]],{icon:L.divIcon({className:'',html:badge(item[2],item[3]),iconAnchor:[45,10]})}).addTo(map);
  });

  // Guardar posicions originals
  if(NODES_ORIG.length===0) NODES.forEach(function(n){ NODES_ORIG.push({lat:n.lat,lng:n.lng}); });
  NODES.forEach(function(_,i){if(NODES[i].deployed)createNodeMarker(i);});
  updateCoordsBar();
  map.whenReady(function(){initCanvas();spawnPackets();startRaf();});
  map.on('move zoom moveend zoomend',syncCanvas);
  window.addEventListener('resize',function(){_cW=0;_cH=0;setTimeout(function(){map.invalidateSize();syncCanvas();},200);});
  document.addEventListener('visibilitychange',function(){if(document.hidden)stopRaf();else startRaf();});
}

function makeNodeIcon(i){
  var d=nodeData[i];
  var isCrit=d&&d.temp>40,isWarn=d&&(d.temp>35||(d.soil!==null&&d.soil<15));
  var cls=isCrit?'crit':isWarn?'warn':'',rc=isCrit?'#ff1744':isWarn?'#ffab40':'#00ff88';
  return L.divIcon({className:'',
    html:'<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">'+
      '<div class="node-pulse-ring" style="border-color:'+rc+';top:1px;left:1px;"></div>'+
      '<div class="node-dot '+cls+'" style="position:relative;z-index:1;"></div></div>',
    iconSize:[36,36],iconAnchor:[18,18],popupAnchor:[0,-22]});
}
function offlineIcon(){
  return L.divIcon({className:'',
    html:'<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;position:relative;">'+
      '<div style="position:absolute;width:34px;height:34px;border-radius:50%;border:1px dashed #333;opacity:.35;"></div>'+
      '<div style="width:10px;height:10px;border-radius:50%;background:rgba(40,40,40,.5);border:1.5px solid #444;position:relative;z-index:1;"></div></div>',
    iconSize:[36,36],iconAnchor:[18,18]});
}
function createNodeMarker(i){
  var cfg=NODES[i];
  var marker=L.marker([cfg.lat,cfg.lng],{icon:offlineIcon(),draggable:editMode,zIndexOffset:500}).addTo(map);
  marker.on('dragend',function(e){
    var p=e.target.getLatLng();NODES[i].lat=p.lat;NODES[i].lng=p.lng;
    updateLines();updateCoordsBar();updateNodePopup(i);
    if(selIdx===i)document.getElementById('nodeCoords').textContent=p.lat.toFixed(6)+', '+p.lng.toFixed(6);
  });
  marker.on('click',function(){selNode(i);});
  var pxToM=function(px){return px/map.getZoomScale(map.getZoom(),0)*156543;};
  var circle=L.circle([cfg.lat,cfg.lng],{radius:pxToM(10),color:'#00ff88',weight:1,dashArray:'5 4',fillColor:'#00ff88',fillOpacity:0,opacity:0}).addTo(map);
  var line=L.polyline([[cfg.lat,cfg.lng],[GW.lat,GW.lng-0.000003]],{color:'#00e5ff',weight:1,dashArray:'4 8',opacity:.18}).addTo(map);
  nodeMarkers[i]=marker;nodeCircles[i]=circle;nodeLines[i]=line;
  updateNodePopup(i);
}
function updateNodePopup(i){
  if(!nodeMarkers[i])return;
  var cfg=NODES[i],d=nodeData[i];
  var online=d&&d.rawTime&&isOnline(d.rawTime);
  var isCrit=d&&d.temp>40,isWarn=d&&(d.temp>35||(d.soil!==null&&d.soil<15));
  var vibrantColor=isCrit?'var(--red)':isWarn?'var(--amber)':'var(--green)';
  var stColor=online?'var(--green)':offlineColor();
  var stTxt=online?'● ONLINE':'○ OFFLINE (MEMÒRIA)';
  var hasData=d&&d.temp!==null;
  var rtColor=isCrit?'var(--red)':isWarn?'var(--amber)':hasData?'var(--green)':txtColor();
  var rt=isCrit?'⚠ CRÍTIC':isWarn?'⚠ MODERAT':hasData?'✓ NORMAL':'—';
  var ultimaDada=hasData?(timeSince(d.rawTime)||'—'):'—';
  var rssiColor=txtColor(),snrColor=txtColor();
  if(d&&d.rssi!=null)rssiColor=d.rssi>-85?'var(--green)':d.rssi>-105?'var(--amber)':'var(--red)';
  if(d&&d.snr!=null)snrColor=d.snr>5?'var(--green)':d.snr>0?'var(--amber)':'var(--red)';
  var batV=d&&d.bat_mv?(d.bat_mv/1000).toFixed(2)+'V':'—';
  var batStr=d&&d.bat_pct!=null?(d.bat_pct+'% ('+batV+')'):'—';
  var batCol=d&&d.bat_pct!=null?batColor(d.bat_pct):txtColor();
  nodeMarkers[i].bindPopup(
    '<div class="popup-title" style="color:'+(online?vibrantColor:txt2Color())+';text-shadow:none">◈ '+cfg.id+'</div>'+
    '<div class="popup-row"><span>Estat</span><span class="popup-val" style="color:'+stColor+'">'+stTxt+'</span></div>'+
    '<div class="popup-row"><span>Temperatura</span><span class="popup-val">'+(hasData?d.temp.toFixed(1)+' °C':'—')+'</span></div>'+
    '<div class="popup-row"><span>Hum. Aire</span><span class="popup-val">'+(hasData&&d.hum!=null?d.hum.toFixed(1)+' %':'—')+'</span></div>'+
    '<div class="popup-row"><span>Hum. Sòl</span><span class="popup-val">'+(hasData&&d.soil!=null?d.soil+' %':'—')+'</span></div>'+
    '<div class="popup-row"><span>Risc</span><span class="popup-val" style="color:'+rtColor+'">'+rt+'</span></div>'+
    '<div style="margin:8px 0;border-top:1px dashed rgba(128,128,128,.3);padding-top:6px;">'+
    '<div class="popup-row" style="font-size:8.5px;"><span>Senyal (RSSI)</span><span class="popup-val" style="color:'+rssiColor+'">'+(d&&d.rssi?d.rssi+' dBm':'—')+'</span></div>'+
    '<div class="popup-row" style="font-size:8.5px;"><span>Qualitat (SNR)</span><span class="popup-val" style="color:'+snrColor+'">'+(d&&d.snr?d.snr+' dB':'—')+'</span></div>'+
    '<div class="popup-row" style="font-size:8.5px;"><span>Bateria</span><span class="popup-val" style="color:'+batCol+'">'+batStr+'</span></div></div>'+
    '<div class="popup-row"><span>Última dada</span><span class="popup-val">'+ultimaDada+'</span></div>'+
    '<div class="popup-coords">Lat: '+cfg.lat.toFixed(6)+' · Lng: '+cfg.lng.toFixed(6)+'</div>'
  );
}
function updateLines(){
  nodeMarkers.forEach(function(m,i){
    if(!m)return;
    var p=m.getLatLng();NODES[i].lat=p.lat;NODES[i].lng=p.lng;
    if(nodeLines[i])nodeLines[i].setLatLngs([[p.lat,p.lng],[GW.lat,GW.lng-0.000003]]);
    if(nodeCircles[i])nodeCircles[i].setLatLng([p.lat,p.lng]);
  });
}
function updateCoordsBar(){
  document.getElementById('coordsAll').innerHTML=NODES.map(function(c,i){
    return '<span style="display:inline-flex;gap:4px;">'+
      '<span style="color:rgba(0,255,136,.5)">N'+(i+1)+':</span>'+
      '<span style="color:var(--cyan)">'+c.lat.toFixed(5)+','+c.lng.toFixed(5)+'</span>'+
      '<span style="color:var(--txt3);font-size:8px">'+(c.deployed?'✓':'○')+'</span></span>';
  }).join('<span style="color:var(--txt3);margin:0 5px">|</span>');
}
function toggleEditMode(){
  editMode=!editMode;
  nodeMarkers.forEach(function(m){if(m)m.dragging[editMode?'enable':'disable']();});
  var et=document.getElementById('editToggle');
  if(et){ et.classList.toggle('active',editMode); et.textContent=editMode?'✓ GUARDAR':'✎ MOURE NODES'; }
  var eb=document.getElementById('editBanner');
  if(eb) eb.classList.toggle('visible',editMode);
  if(!editMode){updateLines();updateCoordsBar();nodeMarkers.forEach(function(_,i){updateNodePopup(i);});}
}
function updateMapMarkers(){
  nodeMarkers.forEach(function(m,i){
    if(!m)return;
    var d=nodeData[i],online=d&&d.status==='online'&&isOnline(d.rawTime);
    var isCrit=d&&d.temp>40,isWarn=d&&(d.temp>35||(d.soil!==null&&d.soil<15));
    var color=isCrit?'#ff1744':isWarn?'#ffab40':'#00ff88';
    if(online){
      m.setIcon(makeNodeIcon(i));
      if(nodeCircles[i])nodeCircles[i].setStyle({color:color,fillColor:color,opacity:.4,fillOpacity:.05});
      if(nodeLines[i])nodeLines[i].setStyle({color:'#00e5ff',opacity:.18,weight:1,dashArray:'4 8'});
    } else {
      m.setIcon(offlineIcon());
      if(nodeCircles[i])nodeCircles[i].setStyle({opacity:0,fillOpacity:0});
      if(nodeLines[i])nodeLines[i].setStyle({opacity:0});
    }
    updateNodePopup(i);
  });
}

// ── CESIUM 3D ─────────────────────────────────────────────────
function initCesium3D(lat,lng,zoom){
  Cesium.Ion.defaultAccessToken=CESIUM_TOKEN;
  cesiumViewer=new Cesium.Viewer('cesium-map',{
    baseLayer:Cesium.ImageryLayer.fromProviderAsync(
      Cesium.TileMapServiceImageryProvider.fromUrl(
        Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
        {fileExtension:'jpg'}
      )
    ),
    animation:false,baseLayerPicker:false,fullscreenButton:false,
    geocoder:false,homeButton:false,infoBox:false,
    sceneModePicker:false,selectionIndicator:false,
    timeline:false,navigationHelpButton:false
  });

  cesiumViewer.imageryLayers.removeAll();
  cesiumViewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      credit:'© Esri World Imagery'
    })
  );

  Cesium.CesiumTerrainProvider.fromIonAssetId(1).then(function(tp){
    cesiumViewer.terrainProvider=tp;
  });

  var scene=cesiumViewer.scene;

  var ctrl = scene.screenSpaceCameraController;
  ctrl.enableTilt   = true;
  ctrl.enableRotate = true;
  ctrl.enableZoom   = true;
  ctrl.enableLook   = false;

  // Click esquerre = rotar/orbitar
  ctrl.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG];

  // Click dret = inclinar (tilt) NOMÉS
  ctrl.tiltEventTypes = [
    Cesium.CameraEventType.RIGHT_DRAG,
    {eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL}
  ];

  // Scroll = zoom NOMÉS
  ctrl.zoomEventTypes = [
    Cesium.CameraEventType.WHEEL,
    Cesium.CameraEventType.PINCH
  ];

  // Desactivar el look (que causava el zoom raro amb click dret)
  ctrl.lookEventTypes = [];

  scene.globe.enableLighting=true;
  scene.globe.atmosphereLightIntensity=10.0;
  scene.globe.showGroundAtmosphere=true;
  scene.fog.enabled=true;
  scene.fog.density=0.00025;
  scene.skyAtmosphere.show=true;

  Cesium.createGooglePhotorealistic3DTileset().then(function(tileset){
    scene.primitives.add(tileset);
    scene.globe.show=false;
    hmEnable3DTools(true);
  }).catch(function(e){
    console.warn('Google Photorealistic no disponible:',e);
    scene.globe.show=true;
  });

  initCesiumClickHandler();

  cesiumViewer.camera.flyTo({
    destination:Cesium.Cartesian3.fromDegrees(2.18590,41.45020,430),
    orientation:{heading:Cesium.Math.toRadians(0),pitch:Cesium.Math.toRadians(-45),roll:0},
    duration:1.8
  });

  NODES.forEach(function(cfg,i){
    if(!cfg.deployed)return;
    var d=nodeData[i];
    var isCrit=d&&d.temp>40,isWarn=d&&(d.temp>35||(d.soil!==null&&d.soil<15));
    var color=isCrit?Cesium.Color.RED:isWarn?Cesium.Color.ORANGE:Cesium.Color.LIME;
    cesiumViewer.entities.add({
      position:Cesium.Cartesian3.fromDegrees(cfg.lng,cfg.lat,10),
      point:{pixelSize:12,color:color,outlineColor:Cesium.Color.WHITE,outlineWidth:2,heightReference:Cesium.HeightReference.CLAMP_TO_GROUND},
      label:{text:cfg.label,font:'11px Share Tech Mono',fillColor:Cesium.Color.CYAN,outlineColor:Cesium.Color.BLACK,outlineWidth:2,style:Cesium.LabelStyle.FILL_AND_OUTLINE,pixelOffset:new Cesium.Cartesian2(0,-20),heightReference:Cesium.HeightReference.CLAMP_TO_GROUND}
    });
  });

  cesiumViewer.entities.add({
    position:Cesium.Cartesian3.fromDegrees(GW.lng,GW.lat,10),
    point:{pixelSize:14,color:Cesium.Color.CYAN,outlineColor:Cesium.Color.WHITE,outlineWidth:2,heightReference:Cesium.HeightReference.CLAMP_TO_GROUND},
    label:{text:'GW',font:'11px Share Tech Mono',fillColor:Cesium.Color.CYAN,outlineColor:Cesium.Color.BLACK,outlineWidth:2,style:Cesium.LabelStyle.FILL_AND_OUTLINE,pixelOffset:new Cesium.Cartesian2(0,-20),heightReference:Cesium.HeightReference.CLAMP_TO_GROUND}
  });
}

function toggleCesium3D(btn){
  if(!is3D){
    var c=map.getCenter(),z=map.getZoom();
    document.getElementById('map').style.display='none';
    if(canvas)canvas.style.display='none';
    document.getElementById('cesium-map').style.display='block';
    if(!cesiumViewer){initCesium3D(c.lat,c.lng,z);}
    else{
      cesiumViewer.camera.flyTo({
        destination:Cesium.Cartesian3.fromDegrees(2.18590,41.45020,430),
        orientation:{heading:Cesium.Math.toRadians(0),pitch:Cesium.Math.toRadians(-45),roll:0},
        duration:1.0
      });
    }
    is3D=true;
    if(btn&&btn.textContent!==undefined)btn.textContent='🗺 2D';
  } else {
    if(cesiumViewer){
      var cam=cesiumViewer.camera;
      var pos=cam.positionCartographic;
      var lat=Cesium.Math.toDegrees(pos.latitude);
      var lng=Cesium.Math.toDegrees(pos.longitude);
      var alt=pos.height;
      var z=Math.round(Math.log2(50000/Math.max(alt,1))+10);
      z=Math.max(1,Math.min(z,20));
      map.setView([lat,lng],z,{animate:false});
    }
    document.getElementById('cesium-map').style.display='none';
    document.getElementById('map').style.display='block';
    if(canvas)canvas.style.display='block';
    setTimeout(function(){map.invalidateSize();syncCanvas();},50);
    is3D=false;
    if(btn&&btn.textContent!==undefined)btn.textContent='🏔 3D';
  }
}

// ── CESIUM CLICK HANDLER ──────────────────────────────────────
var losMode=false,covMode=false,losPoints=[],losPrimitives=[];
var losEntityA=null,losEntityB=null,losEntityLine=null;
var waitingForClick=false;

function initCesiumClickHandler(){
  var handler=new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);
  handler.setInputAction(function(click){
    if((!losMode&&!covMode)||(!waitingForClick&&losMode))return;
    // Usar scene.pickPosition per funcionar amb Google Photorealistic (globe.show=false)
    var pos=cesiumViewer.scene.pickPosition(click.position);
    if(!pos||!Cesium.defined(pos))return;
    if(covMode){
      var sphere=cesiumViewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances:new Cesium.GeometryInstance({
          geometry:new Cesium.EllipsoidGeometry({radii:new Cesium.Cartesian3(500,500,300)}),
          modelMatrix:Cesium.Matrix4.multiplyByTranslation(Cesium.Matrix4.IDENTITY,pos,new Cesium.Matrix4()),
          attributes:{color:Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0,1,0.5,0.15))}
        }),
        appearance:new Cesium.PerInstanceColorAppearance({translucent:true,closed:true})
      }));
      losPrimitives.push(sphere);
      return;
    }
    if(losMode){
      if(losPoints.length===0){
        if(losEntityA){try{cesiumViewer.entities.remove(losEntityA);}catch(e){} losEntityA=null;}
        losEntityA=cesiumViewer.entities.add({position:pos,point:{pixelSize:12,color:Cesium.Color.YELLOW,outlineColor:Cesium.Color.WHITE,outlineWidth:2},label:{text:"A",font:"bold 12px Share Tech Mono",fillColor:Cesium.Color.YELLOW,outlineColor:Cesium.Color.BLACK,outlineWidth:2,style:Cesium.LabelStyle.FILL_AND_OUTLINE,pixelOffset:new Cesium.Cartesian2(0,-22),heightReference:Cesium.HeightReference.NONE}});
        losPoints.push(pos);
        waitingForClick=false;
        cesiumViewer.canvas.style.cursor="default";
        document.getElementById("los-hint").textContent="Punt A posat. Obre menu per afegir punt B";
      } else if(losPoints.length===1){
        if(losEntityB){try{cesiumViewer.entities.remove(losEntityB);}catch(e){} losEntityB=null;}
        if(losEntityLine){try{cesiumViewer.entities.remove(losEntityLine);}catch(e){} losEntityLine=null;}
        var p1=losPoints[0],p2=pos;
        losEntityB=cesiumViewer.entities.add({position:p2,point:{pixelSize:12,color:Cesium.Color.CYAN,outlineColor:Cesium.Color.WHITE,outlineWidth:2},label:{text:"B",font:"bold 12px Share Tech Mono",fillColor:Cesium.Color.CYAN,outlineColor:Cesium.Color.BLACK,outlineWidth:2,style:Cesium.LabelStyle.FILL_AND_OUTLINE,pixelOffset:new Cesium.Cartesian2(0,-22),heightReference:Cesium.HeightReference.NONE}});
        losEntityLine=cesiumViewer.entities.add({polyline:{positions:[p1,p2],width:2,material:new Cesium.ColorMaterialProperty(Cesium.Color.LIME.withAlpha(0.7)),arcType:Cesium.ArcType.NONE}});
        losPoints.push(p2);
        waitingForClick=false;
        cesiumViewer.canvas.style.cursor="default";
        runElevationProfile(p1,p2);
      }
    }
  },Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
var losMenuOpen = false;

function toggleLOSMenu(){
  losMenuOpen = !losMenuOpen;
  document.getElementById('los-dots-menu').classList.toggle('open', losMenuOpen);
}

function losAddPoint(){
  losMenuOpen = false;
  document.getElementById('los-dots-menu').classList.remove('open');
  waitingForClick = true;
  if(cesiumViewer)cesiumViewer.canvas.style.cursor='crosshair';
  var hint = document.getElementById('los-hint');
  hint.style.display = 'block';
  if(losPoints.length===0){
    hint.textContent = 'Click per posar punt A (origen)';
  } else if(losPoints.length===1){
    hint.textContent = 'Click per posar punt B (desti)';
  } else {
    // Reiniciar
    if(losEntityA){ try{cesiumViewer.entities.remove(losEntityA);}catch(e){} losEntityA=null; }
    if(losEntityB){ try{cesiumViewer.entities.remove(losEntityB);}catch(e){} losEntityB=null; }
    if(losEntityLine){ try{cesiumViewer.entities.remove(losEntityLine);}catch(e){} losEntityLine=null; }
    losPoints=[];
    elevClose();
    hint.textContent = 'Click per posar nou punt A (origen)';
  }
}

function losRemovePoint(){
  losMenuOpen = false;
  document.getElementById('los-dots-menu').classList.remove('open');
  if(losPoints.length===2){
    if(losEntityB){ try{cesiumViewer.entities.remove(losEntityB);}catch(e){} losEntityB=null; }
    if(losEntityLine){ try{cesiumViewer.entities.remove(losEntityLine);}catch(e){} losEntityLine=null; }
    losPoints.pop();
    waitingForClick=false;
    elevClose();
    document.getElementById('los-hint').textContent='Punt A actiu. Afegeix punt B des del menu';
  } else if(losPoints.length===1){
    if(losEntityA){ try{cesiumViewer.entities.remove(losEntityA);}catch(e){} losEntityA=null; }
    losPoints=[];
    waitingForClick=false;
    cesiumViewer.canvas.style.cursor='default';
    document.getElementById('los-hint').textContent='Obre el menu per afegir punt A';
  } else {
    document.getElementById('los-hint').textContent='No hi ha punts per eliminar';
  }
}

// ── MENU HAMBURGUESA ──────────────────────────────────────────
var hmOpen = false;

function toggleHMenu(){
  hmOpen = !hmOpen;
  document.getElementById('hmenu-panel').classList.toggle('open', hmOpen);
}

function hmSetMap(mode){
  toggleHMenu();

  // Si estem en mode edicio, desactivar-lo primer
  if(editMode){
    toggleEditMode();
    ['hm-edit-txt-c','hm-edit-txt-s'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.textContent='Moure Nodes';
    });
    ['hm-edit-icon-c','hm-edit-icon-s'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.textContent='✎';
    });
  }
  // Restaurar posicions originals
  NODES.forEach(function(n,i){
    if(NODES_ORIG[i]){ n.lat=NODES_ORIG[i].lat; n.lng=NODES_ORIG[i].lng; }
    if(nodeMarkers[i]) nodeMarkers[i].setLatLng([n.lat,n.lng]);
    if(nodeLines[i]) nodeLines[i].setLatLngs([[n.lat,n.lng],[GW.lat,GW.lng-0.000003]]);
    if(nodeCircles[i]) nodeCircles[i].setLatLng([n.lat,n.lng]);
  });
  updateCoordsBar();

  if(mode==='3d'){
    // Anar a 3D des de sat
    if(currentMap!=='sat'){ map.removeLayer(cartoLayer); satelliteLayer.addTo(map); currentMap='sat'; }
    toggleCesium3D(btn3d);
    document.getElementById('hm-view-carto').style.display='none';
    document.getElementById('hm-view-sat').style.display='none';
    document.getElementById('hm-view-3d').style.display='block';
    return;
  }

  if(mode==='2d'){
    // Tornar a sat des de 3D
    if(is3D) toggleCesium3D(btn3d);
    document.getElementById('hm-view-carto').style.display='none';
    document.getElementById('hm-view-sat').style.display='block';
    document.getElementById('hm-view-3d').style.display='none';
    return;
  }

  if(mode==='carto'){
    if(is3D) toggleCesium3D(btn3d);
    if(currentMap==='sat'){ map.removeLayer(satelliteLayer); cartoLayer.addTo(map); currentMap='carto'; }
    document.getElementById('hm-view-carto').style.display='block';
    document.getElementById('hm-view-sat').style.display='none';
    document.getElementById('hm-view-3d').style.display='none';
    return;
  }

  if(mode==='sat'){
    if(currentMap==='carto'){ map.removeLayer(cartoLayer); satelliteLayer.addTo(map); currentMap='sat'; }
    document.getElementById('hm-view-carto').style.display='none';
    document.getElementById('hm-view-sat').style.display='block';
    document.getElementById('hm-view-3d').style.display='none';
    return;
  }
}

function hmEnable3DTools(on){
  ['hm-los','hm-cov','hm-clr'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.disabled=!on;
  });
}

function hmEdit(){
  // Tancar menu primer
  hmOpen = false;
  document.getElementById('hmenu-panel').classList.remove('open');

  // Canviar mode
  toggleEditMode();

  // Actualitzar text per la propera vegada que s'obri el menu
  // editMode ja es el nou valor
  var txt  = editMode ? 'Guardar Posició' : 'Moure Nodes';
  var icon = editMode ? '✓' : '✎';
  ['hm-edit-txt-c','hm-edit-txt-s'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.textContent=txt;
  });
  ['hm-edit-icon-c','hm-edit-icon-s'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.textContent=icon;
  });
}

function hmLOS(){
  covMode=false;
  var hcov=document.getElementById('hm-cov');
  if(hcov)hcov.className='hm-btn';
  losMode=!losMode; losPoints=[];
  var hint=document.getElementById('los-hint');
  if(losMode){
    var hlos=document.getElementById('hm-los');
    if(hlos)hlos.className='hm-btn active';
    document.getElementById('los-dots-wrap').style.display='block';
    hint.style.display='block';
    hint.textContent='Click per definir ORIGEN';
    if(cesiumViewer)cesiumViewer.canvas.style.cursor='default';
  } else {
    var hlos=document.getElementById('hm-los');
    if(hlos)hlos.className='hm-btn';
    hint.style.display='none';
    if(cesiumViewer)cesiumViewer.canvas.style.cursor='';
    document.getElementById('los-dots-wrap').style.display='none';
  }
  toggleHMenu();
}

function hmCOV(){
  losMode=false;
  var hlos=document.getElementById('hm-los');
  if(hlos)hlos.className='hm-btn';
  covMode=!covMode;
  var hint=document.getElementById('los-hint');
  if(covMode){
    var hcov=document.getElementById('hm-cov');
    if(hcov)hcov.className='hm-btn act-green';
    hint.style.display='block';
    hint.textContent='Click per col·locar antena (500m)';
    if(cesiumViewer)cesiumViewer.canvas.style.cursor='default';
  } else {
    var hcov=document.getElementById('hm-cov');
    if(hcov)hcov.className='hm-btn';
    hint.style.display='none';
    if(cesiumViewer)cesiumViewer.canvas.style.cursor='';
  }
  toggleHMenu();
}

function hmClear(){
  if(!cesiumViewer)return;
  losPrimitives.forEach(function(p){ try{cesiumViewer.scene.primitives.remove(p);}catch(e){} });
  losPrimitives=[]; losPoints=[]; waitingForClick=false;
  if(losEntityA){ try{cesiumViewer.entities.remove(losEntityA);}catch(e){} losEntityA=null; }
  if(losEntityB){ try{cesiumViewer.entities.remove(losEntityB);}catch(e){} losEntityB=null; }
  if(losEntityLine){ try{cesiumViewer.entities.remove(losEntityLine);}catch(e){} losEntityLine=null; }
  losMode=false; covMode=false;
  var hlos=document.getElementById("hm-los");
  var hcov=document.getElementById("hm-cov");
  if(hlos)hlos.className="hm-btn";
  if(hcov)hcov.className="hm-btn";
  document.getElementById("los-hint").style.display="none";
  document.getElementById("los-dots-wrap").style.display="none";
  cesiumViewer.canvas.style.cursor="default";
  showToolInfo(null);
  elevClose();
  toggleHMenu();
}

// ── PANEL ELEVACIO / LOS AVANÇAT ─────────────────────────────
var elevChart = null;
var elevFreq = 869; // MHz
var elevData = null;
var LOS_SAMPLES = 60;

function elevClose(){
  document.getElementById('elev-panel').style.display='none';
  if(elevChart){ elevChart.destroy(); elevChart=null; }
}

function elevConfig(){
  var f = prompt('Freqüència (MHz):', elevFreq);
  if(f && !isNaN(f)){ elevFreq = parseFloat(f); if(elevData) renderElevPanel(elevData); }
}

function elevSave(){
  if(!elevChart) return;
  var canvas = document.getElementById('elev-chart');
  // Fons negre per al PNG
  var exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  var ctx2 = exportCanvas.getContext('2d');
  ctx2.fillStyle = 'rgba(4,14,22,1)';
  ctx2.fillRect(0,0,exportCanvas.width,exportCanvas.height);
  ctx2.drawImage(canvas,0,0);
  var a = document.createElement('a');
  a.href = exportCanvas.toDataURL('image/png');
  a.download = 'los_profile.png';
  a.click();
}

// FSPL
function calcFSPL(distM, freqMHz){
  return 20*Math.log10(distM) + 20*Math.log10(freqMHz*1e6) - 147.55;
}

// Fresnel radius
function fresnelR(d1, d2, freqMHz){
  var lambda = 3e8 / (freqMHz * 1e6);
  return Math.sqrt(lambda * d1 * d2 / (d1 + d2));
}

async function runElevationProfile(posA, posB){
  if(!cesiumViewer) return;
  var scene = cesiumViewer.scene;

  var cartA = Cesium.Cartographic.fromCartesian(posA);
  var cartB = Cesium.Cartographic.fromCartesian(posB);

  var latA = Cesium.Math.toDegrees(cartA.latitude);
  var lngA = Cesium.Math.toDegrees(cartA.longitude);
  var latB = Cesium.Math.toDegrees(cartB.latitude);
  var lngB = Cesium.Math.toDegrees(cartB.longitude);

  var elevA = cartA.height;
  var elevB = cartB.height;

  // Total distance
  var distTotal = Cesium.Cartesian3.distance(posA, posB);

  // Show panel
  document.getElementById('elev-panel').style.display='block';
  document.getElementById('elev-info-a').textContent =
    'Origen A: '+latA.toFixed(5)+', '+lngA.toFixed(5)+' | Elev: '+elevA.toFixed(1)+'m';
  document.getElementById('elev-info-b').textContent =
    'Destí B:  '+latB.toFixed(5)+', '+lngB.toFixed(5)+' | Elev: '+elevB.toFixed(1)+'m';

  var fspl = calcFSPL(distTotal, elevFreq);
  document.getElementById('elev-info-rf').textContent =
    'RF: '+elevFreq+'MHz | Dist: '+(distTotal/1000).toFixed(2)+'km | FSPL: '+fspl.toFixed(1)+'dB | Refrac: 0.25';

  // Hint
    document.getElementById('los-hint').textContent = 'Calculant perfil...';

  // Mostrejar punts intermedis
  var positions = [];
  var distances = [];
  var heights = [];

  var promises = [];
  for(var i=0; i<=LOS_SAMPLES; i++){
    var t = i/LOS_SAMPLES;
    var pos = Cesium.Cartesian3.lerp(posA, posB, t, new Cesium.Cartesian3());
    positions.push(pos);
    distances.push(t * distTotal);
  }

  // Sample
  try {
    var sampledHeights = await Cesium.sampleTerrainMostDetailed(
      cesiumViewer.terrainProvider,
      positions.map(function(p){
        var c = Cesium.Cartographic.fromCartesian(p);
        return new Cesium.Cartographic(c.longitude, c.latitude);
      })
    );
    heights = sampledHeights.map(function(c){ return c.height || 0; });
  } catch(e) {
    // Fallback: usar heights dels cartographics
    heights = positions.map(function(p){
      return Cesium.Cartographic.fromCartesian(p).height || 0;
    });
  }

  // LOS heights A→B
  var losHeights = distances.map(function(d){
    return elevA + (elevB - elevA) * (d / distTotal);
  });

  // Detect obstructions
  var firstObstruction = -1;
  for(var i=0; i<heights.length; i++){
    if(heights[i] > losHeights[i] + 1){
      firstObstruction = i;
      break;
    }
  }

  // Fresnel zones
  var fresnelTop = distances.map(function(d, i){
    var d1 = d, d2 = distTotal - d;
    if(d1<=0 || d2<=0) return losHeights[i];
    return losHeights[i] + fresnelR(d1, d2, elevFreq);
  });
  var fresnelBot = distances.map(function(d, i){
    var d1 = d, d2 = distTotal - d;
    if(d1<=0 || d2<=0) return losHeights[i];
    return losHeights[i] - fresnelR(d1, d2, elevFreq);
  });

  // Save data
  elevData = {
    distTotal: distTotal, freq: elevFreq, fspl: fspl,
    pointA: {lat:latA,lng:lngA,elev:elevA},
    pointB: {lat:latB,lng:lngB,elev:elevB},
    samples: distances.map(function(d,i){
      return {dist:d,terrain:heights[i],los:losHeights[i]};
    })
  };

  renderElevPanel({
    distances: distances, heights: heights,
    losHeights: losHeights, firstObstruction: firstObstruction,
    fresnelTop: fresnelTop, fresnelBot: fresnelBot
  });

  document.getElementById('los-hint').textContent =
    firstObstruction>=0 ? '🔴 OBSTRUÏDA — Obstrucció a '+(distances[firstObstruction]/1000).toFixed(2)+'km' : '🟢 LLIURE — Visió directa OK';
}

function renderElevPanel(d){
  if(elevChart){ elevChart.destroy(); elevChart=null; }
  var ctx = document.getElementById('elev-chart').getContext('2d');

  // LOS colors - verd fins obstrucció, vermell després
  var losColors = d.distances.map(function(_,i){
    return (d.firstObstruction>=0 && i>=d.firstObstruction) ? 'rgba(255,23,68,1)' : 'rgba(0,255,136,1)';
  });

  elevChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.distances.map(function(v){ return (v/1000).toFixed(2); }),
      datasets: [
        // Terreny (area marró)
        {
          label: 'Terreny',
          data: d.heights,
          fill: 'origin',
          backgroundColor: 'rgba(120,80,40,.55)',
          borderColor: 'rgba(160,110,60,.8)',
          borderWidth: 1.5,
          pointRadius: 0, tension: 0.3, order: 4
        },
        // Fresnel superior
        {
          label: 'Fresnel+',
          data: d.fresnelTop,
          fill: false,
          borderColor: 'rgba(255,100,100,.25)',
          borderWidth: 1,
          borderDash: [3,3],
          pointRadius: 0, tension: 0.3, order: 2
        },
        // Fresnel inferior
        {
          label: 'Fresnel-',
          data: d.fresnelBot,
          fill: '-1',
          backgroundColor: 'rgba(255,50,50,.06)',
          borderColor: 'rgba(255,100,100,.25)',
          borderWidth: 1,
          borderDash: [3,3],
          pointRadius: 0, tension: 0.3, order: 2
        },
        // LOS
        {
          label: 'LOS',
          data: d.losHeights,
          fill: false,
          borderColor: d.firstObstruction>=0 ? 'rgba(255,23,68,.9)' : 'rgba(0,255,136,.9)',
          borderWidth: 2.5,
          pointRadius: function(ctx){
            var i=ctx.dataIndex,n=d.distances.length-1;
            return (i===0||i===n)?6:0;
          },
          pointBackgroundColor: '#00e5ff',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0, order: 1
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: {duration: 400},
      plugins: {
        legend: {display: false},
        tooltip: {
          mode: 'index', intersect: false,
          backgroundColor: 'rgba(4,14,22,.95)',
          borderColor: 'rgba(0,229,255,.3)', borderWidth: 1,
          titleColor: '#00e5ff', bodyColor: 'rgba(0,229,255,.7)',
          titleFont: {family:'Share Tech Mono', size:9},
          bodyFont: {family:'Share Tech Mono', size:8},
          callbacks: {
            title: function(items){ return 'Dist: '+items[0].label+'km'; },
            label: function(item){
              if(item.datasetIndex===0) return 'Terreny: '+item.raw.toFixed(1)+'m';
              if(item.datasetIndex===3) return 'LOS: '+item.raw.toFixed(1)+'m';
              return null;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {color:'rgba(0,229,255,.06)'},
          ticks: {color:'rgba(0,229,255,.5)',font:{family:'Share Tech Mono',size:8},
            maxTicksLimit:8,
            callback:function(v,i){ return d.distances[i]?(d.distances[i]/1000).toFixed(1)+'km':null; }
          },
          title: {display:true,text:'Distància (km)',color:'rgba(0,229,255,.4)',
            font:{family:'Share Tech Mono',size:8}}
        },
        y: {
          grid: {color:'rgba(0,229,255,.06)'},
          ticks: {color:'rgba(0,229,255,.5)',font:{family:'Share Tech Mono',size:8},
            callback:function(v){ return v.toFixed(0)+'m'; }
          },
          title: {display:true,text:'Elevació (m)',color:'rgba(0,229,255,.4)',
            font:{family:'Share Tech Mono',size:8}}
        }
      }
    }
  });
}

function hmSetMap(mode){
  toggleHMenu();

  // Si estem en mode edicio, desactivar-lo primer
  if(editMode){
    toggleEditMode();
    ['hm-edit-txt-c','hm-edit-txt-s'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.textContent='Moure Nodes';
    });
    ['hm-edit-icon-c','hm-edit-icon-s'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.textContent='✎';
    });
  }
  // Restaurar posicions originals
  NODES.forEach(function(n,i){
    if(NODES_ORIG[i]){ n.lat=NODES_ORIG[i].lat; n.lng=NODES_ORIG[i].lng; }
    if(nodeMarkers[i]) nodeMarkers[i].setLatLng([n.lat,n.lng]);
    if(nodeLines[i]) nodeLines[i].setLatLngs([[n.lat,n.lng],[GW.lat,GW.lng-0.000003]]);
    if(nodeCircles[i]) nodeCircles[i].setLatLng([n.lat,n.lng]);
  });
  updateCoordsBar();

  if(mode==='3d'){
    // Anar a 3D des de sat
    if(currentMap!=='sat'){ map.removeLayer(cartoLayer); satelliteLayer.addTo(map); currentMap='sat'; }
    toggleCesium3D(btn3d);
    document.getElementById('hm-view-carto').style.display='none';
    document.getElementById('hm-view-sat').style.display='none';
    document.getElementById('hm-view-3d').style.display='block';
    return;
  }

  if(mode==='2d'){
    // Tornar a sat des de 3D
    if(is3D) toggleCesium3D(btn3d);
    document.getElementById('hm-view-carto').style.display='none';
    document.getElementById('hm-view-sat').style.display='block';
    document.getElementById('hm-view-3d').style.display='none';
    return;
  }

  if(mode==='carto'){
    if(is3D) toggleCesium3D(btn3d);
    if(currentMap==='sat'){ map.removeLayer(satelliteLayer); cartoLayer.addTo(map); currentMap='carto'; }
    document.getElementById('hm-view-carto').style.display='block';
    document.getElementById('hm-view-sat').style.display='none';
    document.getElementById('hm-view-3d').style.display='none';
    return;
  }

  if(mode==='sat'){
    if(currentMap==='carto'){ map.removeLayer(cartoLayer); satelliteLayer.addTo(map); currentMap='sat'; }
    document.getElementById('hm-view-carto').style.display='none';
    document.getElementById('hm-view-sat').style.display='block';
    document.getElementById('hm-view-3d').style.display='none';
    return;
  }
}

function hmEnable3DTools(on){
  ['hm-los','hm-cov','hm-clr'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.disabled=!on;
  });
}

function hmEdit(){
  // Tancar menu primer
  hmOpen = false;
  document.getElementById('hmenu-panel').classList.remove('open');

  // Canviar mode
  toggleEditMode();

  // Actualitzar text per la propera vegada que s'obri el menu
  // editMode ja es el nou valor
  var txt  = editMode ? 'Guardar Posició' : 'Moure Nodes';
  var icon = editMode ? '✓' : '✎';
  ['hm-edit-txt-c','hm-edit-txt-s'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.textContent=txt;
  });
  ['hm-edit-icon-c','hm-edit-icon-s'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.textContent=icon;
  });
}

function hmLOS(){
  covMode=false;
  var hcov=document.getElementById('hm-cov');
  if(hcov)hcov.className='hm-btn';
  losMode=!losMode; losPoints=[];
  var hint=document.getElementById('los-hint');
  if(losMode){
    var hlos=document.getElementById('hm-los');
    if(hlos)hlos.className='hm-btn active';
    document.getElementById('los-dots-wrap').style.display='block';
    hint.style.display='block';
    hint.textContent='Click per definir ORIGEN';
    if(cesiumViewer)cesiumViewer.canvas.style.cursor='default';
  } else {
    var hlos=document.getElementById('hm-los');
    if(hlos)hlos.className='hm-btn';
    hint.style.display='none';
    if(cesiumViewer)cesiumViewer.canvas.style.cursor='';
    document.getElementById('los-dots-wrap').style.display='none';
  }
  toggleHMenu();
}

function hmCOV(){
  losMode=false;
  var hlos=document.getElementById('hm-los');
  if(hlos)hlos.className='hm-btn';
  var hcov=document.getElementById('hm-cov');
  if(hcov)hcov.className='hm-btn act-green';
  toggleHMenu();
  rfOpenPanel();
}

function hmClear(){
  if(!cesiumViewer)return;
  losPrimitives.forEach(function(p){ try{cesiumViewer.scene.primitives.remove(p);}catch(e){} });
  losPrimitives=[]; losPoints=[]; waitingForClick=false;
  if(losEntityA){ try{cesiumViewer.entities.remove(losEntityA);}catch(e){} losEntityA=null; }
  if(losEntityB){ try{cesiumViewer.entities.remove(losEntityB);}catch(e){} losEntityB=null; }
  if(losEntityLine){ try{cesiumViewer.entities.remove(losEntityLine);}catch(e){} losEntityLine=null; }
  covMode=false;
  losMenuOpen=false;
  document.getElementById("los-dots-menu").classList.remove("open");
  var hlos=document.getElementById("hm-los");
  var hcov=document.getElementById("hm-cov");
  if(hlos)hlos.className="hm-btn";
  if(hcov)hcov.className="hm-btn";
  document.getElementById("los-hint").style.display="none";
  cesiumViewer.canvas.style.cursor="default";
  showToolInfo(null);
  elevClose();
  toggleHMenu();
  if(losMode) document.getElementById("los-dots-wrap").style.display="block";
}

// ── PANEL ELEVACIO / LOS AVANÇAT ─────────────────────────────
var elevChart = null;
var elevFreq = 869; // MHz
var elevData = null;
var LOS_SAMPLES = 60;

function elevClose(){
  document.getElementById('elev-panel').style.display='none';
  if(elevChart){ elevChart.destroy(); elevChart=null; }
}

function elevConfig(){
  var f = prompt('Freqüència (MHz):', elevFreq);
  if(f && !isNaN(f)){ elevFreq = parseFloat(f); if(elevData) renderElevPanel(elevData); }
}

function elevSave(){
  if(!elevChart) return;
  var chartCanvas = document.getElementById('elev-chart');
  var infoA = document.getElementById('elev-info-a').textContent;
  var infoB = document.getElementById('elev-info-b').textContent;
  var infoRF = document.getElementById('elev-info-rf').textContent;
  var hintTxt = document.getElementById('los-hint').textContent;

  var padding = 16;
  var headerH = 70;
  var exportCanvas = document.createElement('canvas');
  exportCanvas.width = chartCanvas.width + padding*2;
  exportCanvas.height = chartCanvas.height + headerH + padding;
  var ctx2 = exportCanvas.getContext('2d');

  // Fons
  ctx2.fillStyle = 'rgba(4,14,22,1)';
  ctx2.fillRect(0,0,exportCanvas.width,exportCanvas.height);

  // Border
  ctx2.strokeStyle = 'rgba(0,229,255,.3)';
  ctx2.lineWidth = 1;
  ctx2.strokeRect(1,1,exportCanvas.width-2,exportCanvas.height-2);

  // Header text
  ctx2.font = '600 12px monospace';
  ctx2.fillStyle = '#00e5ff';
  ctx2.fillText(infoA, padding, 20);
  ctx2.fillText(infoB, padding, 36);
  ctx2.fillStyle = '#00ff88';
  ctx2.font = '11px monospace';
  ctx2.fillText(infoRF, padding, 52);

  // LOS status
  ctx2.font = 'bold 11px monospace';
  ctx2.fillStyle = hintTxt.indexOf('VISIBLE')>=0 ? '#00ff88' : '#ff1744';
  ctx2.textAlign = 'right';
  ctx2.fillText(hintTxt, exportCanvas.width-padding, 36);
  ctx2.textAlign = 'left';

  // Separador
  ctx2.strokeStyle = 'rgba(0,229,255,.2)';
  ctx2.beginPath();
  ctx2.moveTo(padding, 60);
  ctx2.lineTo(exportCanvas.width-padding, 60);
  ctx2.stroke();

  // Grafic centrat
  ctx2.drawImage(chartCanvas, padding, headerH);

  var a = document.createElement('a');
  a.href = exportCanvas.toDataURL('image/png');
  a.download = 'los_profile.png';
  a.click();
}

// FSPL
function calcFSPL(distM, freqMHz){
  return 20*Math.log10(distM) + 20*Math.log10(freqMHz*1e6) - 147.55;
}

// Fresnel radius
function fresnelR(d1, d2, freqMHz){
  var lambda = 3e8 / (freqMHz * 1e6);
  return Math.sqrt(lambda * d1 * d2 / (d1 + d2));
}

async function runElevationProfile(posA, posB){
  if(!cesiumViewer) return;
  var scene = cesiumViewer.scene;

  var cartA = Cesium.Cartographic.fromCartesian(posA);
  var cartB = Cesium.Cartographic.fromCartesian(posB);

  var latA = Cesium.Math.toDegrees(cartA.latitude);
  var lngA = Cesium.Math.toDegrees(cartA.longitude);
  var latB = Cesium.Math.toDegrees(cartB.latitude);
  var lngB = Cesium.Math.toDegrees(cartB.longitude);

  var elevA = cartA.height;
  var elevB = cartB.height;

  // Total distance
  var distTotal = Cesium.Cartesian3.distance(posA, posB);

  // Show panel
  document.getElementById('elev-panel').style.display='block';
  document.getElementById('elev-info-a').textContent =
    'Origen A: '+latA.toFixed(5)+', '+lngA.toFixed(5)+' | Elev: '+elevA.toFixed(1)+'m';
  document.getElementById('elev-info-b').textContent =
    'Destí B:  '+latB.toFixed(5)+', '+lngB.toFixed(5)+' | Elev: '+elevB.toFixed(1)+'m';

  var fspl = calcFSPL(distTotal, elevFreq);
  document.getElementById('elev-info-rf').textContent =
    'RF: '+elevFreq+'MHz | Dist: '+(distTotal/1000).toFixed(2)+'km | FSPL: '+fspl.toFixed(1)+'dB | Refrac: 0.25';

  // Hint
    document.getElementById('los-hint').textContent = 'Calculant perfil...';

  // Mostrejar punts intermedis
  var positions = [];
  var distances = [];
  var heights = [];

  var promises = [];
  for(var i=0; i<=LOS_SAMPLES; i++){
    var t = i/LOS_SAMPLES;
    var pos = Cesium.Cartesian3.lerp(posA, posB, t, new Cesium.Cartesian3());
    positions.push(pos);
    distances.push(t * distTotal);
  }

  // Sample
  try {
    var sampledHeights = await Cesium.sampleTerrainMostDetailed(
      cesiumViewer.terrainProvider,
      positions.map(function(p){
        var c = Cesium.Cartographic.fromCartesian(p);
        return new Cesium.Cartographic(c.longitude, c.latitude);
      })
    );
    heights = sampledHeights.map(function(c){ return c.height || 0; });
  } catch(e) {
    // Fallback: usar heights dels cartographics
    heights = positions.map(function(p){
      return Cesium.Cartographic.fromCartesian(p).height || 0;
    });
  }

  // LOS heights A→B
  var losHeights = distances.map(function(d){
    return elevA + (elevB - elevA) * (d / distTotal);
  });

  // Detect obstructions
  var firstObstruction = -1;
  for(var i=0; i<heights.length; i++){
    if(heights[i] > losHeights[i] + 1){
      firstObstruction = i;
      break;
    }
  }

  // Fresnel zones
  var fresnelTop = distances.map(function(d, i){
    var d1 = d, d2 = distTotal - d;
    if(d1<=0 || d2<=0) return losHeights[i];
    return losHeights[i] + fresnelR(d1, d2, elevFreq);
  });
  var fresnelBot = distances.map(function(d, i){
    var d1 = d, d2 = distTotal - d;
    if(d1<=0 || d2<=0) return losHeights[i];
    return losHeights[i] - fresnelR(d1, d2, elevFreq);
  });

  // Save data
  elevData = {
    distTotal: distTotal, freq: elevFreq, fspl: fspl,
    pointA: {lat:latA,lng:lngA,elev:elevA},
    pointB: {lat:latB,lng:lngB,elev:elevB},
    samples: distances.map(function(d,i){
      return {dist:d,terrain:heights[i],los:losHeights[i]};
    })
  };

  renderElevPanel({
    distances: distances, heights: heights,
    losHeights: losHeights, firstObstruction: firstObstruction,
    fresnelTop: fresnelTop, fresnelBot: fresnelBot
  });

  document.getElementById('los-hint').textContent =
    firstObstruction>=0 ? '🔴 OBSTRUÏDA — a '+(distances[firstObstruction]/1000).toFixed(2)+'km' : '🟢 VISIBLE — Visió directa OK';
}

function renderElevPanel(d){
  if(elevChart){ elevChart.destroy(); elevChart=null; }
  var ctx = document.getElementById('elev-chart').getContext('2d');

  // LOS colors - verd fins obstrucció, vermell després
  var losColors = d.distances.map(function(_,i){
    return (d.firstObstruction>=0 && i>=d.firstObstruction) ? 'rgba(255,23,68,1)' : 'rgba(0,255,136,1)';
  });

  elevChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.distances.map(function(v){ return (v/1000).toFixed(2); }),
      datasets: [
        // Terreny (area marró)
        {
          label: 'Terreny',
          data: d.heights,
          fill: 'origin',
          backgroundColor: 'rgba(120,80,40,.55)',
          borderColor: 'rgba(160,110,60,.8)',
          borderWidth: 1.5,
          pointRadius: 0, tension: 0.3, order: 4
        },
        // Fresnel superior
        {
          label: 'Fresnel+',
          data: d.fresnelTop,
          fill: false,
          borderColor: 'rgba(255,100,100,.25)',
          borderWidth: 1,
          borderDash: [3,3],
          pointRadius: 0, tension: 0.3, order: 2
        },
        // Fresnel inferior
        {
          label: 'Fresnel-',
          data: d.fresnelBot,
          fill: '-1',
          backgroundColor: 'rgba(255,50,50,.06)',
          borderColor: 'rgba(255,100,100,.25)',
          borderWidth: 1,
          borderDash: [3,3],
          pointRadius: 0, tension: 0.3, order: 2
        },
        // LOS
        {
          label: 'LOS',
          data: d.losHeights,
          fill: false,
          borderColor: d.firstObstruction>=0 ? 'rgba(255,23,68,.9)' : 'rgba(0,255,136,.9)',
          borderWidth: 2.5,
          pointRadius: function(ctx){
            var i=ctx.dataIndex,n=d.distances.length-1;
            return (i===0||i===n)?6:0;
          },
          pointBackgroundColor: '#00e5ff',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0, order: 1, clip: false
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: {duration: 400},
      plugins: {
        legend: {display: false},
        tooltip: {
          mode: 'index', intersect: false,
          backgroundColor: 'rgba(4,14,22,.95)',
          borderColor: 'rgba(0,229,255,.3)', borderWidth: 1,
          titleColor: '#00e5ff', bodyColor: 'rgba(0,229,255,.7)',
          titleFont: {family:'Share Tech Mono', size:9},
          bodyFont: {family:'Share Tech Mono', size:8},
          callbacks: {
            title: function(items){ return 'Dist: '+items[0].label+'km'; },
            label: function(item){
              if(item.datasetIndex===0) return 'Terreny: '+item.raw.toFixed(1)+'m';
              if(item.datasetIndex===3) return 'LOS: '+item.raw.toFixed(1)+'m';
              return null;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {color:'rgba(0,229,255,.06)'},
          ticks: {color:'rgba(0,229,255,.5)',font:{family:'Share Tech Mono',size:8},
            maxTicksLimit:8,
            callback:function(v,i){ return d.distances[i]?(d.distances[i]/1000).toFixed(1)+'km':null; }
          },
          title: {display:true,text:'Distància (km)',color:'rgba(0,229,255,.4)',
            font:{family:'Share Tech Mono',size:8}}
        },
        y: {
          grid: {color:'rgba(0,229,255,.06)'},
          ticks: {color:'rgba(0,229,255,.5)',font:{family:'Share Tech Mono',size:8},
            callback:function(v){ return v.toFixed(0)+'m'; }
          },
          title: {display:true,text:'Elevació (m)',color:'rgba(0,229,255,.4)',
            font:{family:'Share Tech Mono',size:8}}
        }
      }
    }
});}

// ── RF COVERAGE INTEGRATION ─────────────────────────────────────
function rfOpenPanel(){
  var p=document.getElementById('rf-panel');
  p.style.display='flex';p.style.flexDirection='column';
}
function rfClosePanel(){
  document.getElementById('rf-panel').style.display='none';
}
function rfGetParams(){
  return {
    txPower:    parseFloat(document.getElementById('rf-txpower').value)||27,
    freq:       parseFloat(document.getElementById('rf-freq').value)||868,
    txGain:     parseFloat(document.getElementById('rf-txgain').value)||3,
    rxGain:     parseFloat(document.getElementById('rf-rxgain').value)||2,
    txHeight:   parseFloat(document.getElementById('rf-txh').value)||10,
    rxHeight:   1.5,
    rxSens:     parseFloat(document.getElementById('rf-sens').value)||-137,
    radius:     parseFloat(document.getElementById('rf-radius').value)||3000,
    environment:document.getElementById('rf-env').value||'urban',
    gridStep:   80
  };
}
function rfLaunch(){
  rfClosePanel();
  covMode=true;
  waitingForClick=true;
  if(cesiumViewer) cesiumViewer.canvas.style.cursor='crosshair';
  var hint=document.getElementById('los-hint');
  hint.style.display='block';
  hint.textContent='📡 Clica per col·locar el node al mapa 3D';
}
function rfClearCoverage(){
  if(typeof RFMulti!=='undefined') RFMulti.clearAll(cesiumViewer);
  else if(typeof RFCoverage!=='undefined') RFCoverage.clear(cesiumViewer);
  covMode=false;
  var hcov=document.getElementById('hm-cov');
  if(hcov)hcov.className='hm-btn';
  var hint=document.getElementById('los-hint');
  if(hint)hint.style.display='none';
}
