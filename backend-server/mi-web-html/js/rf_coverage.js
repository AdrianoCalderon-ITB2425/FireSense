(function(window){
'use strict';
var RF=window.RFCoverage={};
RF.params={txPower:27,freq:868,txGain:3,rxGain:2,txHeight:10,rxHeight:1.5,rxSens:-137,radius:3000,gridStep:80,environment:'urban'};
RF.active=false;RF.antennaPos=null;RF.pointColl=null;RF.antEntity=null;RF.working=false;

RF.fspl=function(d,f){if(d<1)d=1;return 32.45+20*Math.log10(f)+20*Math.log10(d/1000);};
RF.clutterLoss=function(e){return e==='urban'?22:e==='suburban'?12:5;};
RF.knifeEdge=function(nu){if(nu<-0.7)return 0;if(nu<=0)return 20*Math.log10(0.5-0.62*nu);if(nu<=1)return 20*Math.log10(0.5*Math.exp(-0.95*nu));if(nu<=2.4)return 20*Math.log10(0.4-Math.sqrt(Math.max(0,0.1184-Math.pow(0.38-0.1*nu,2))));return 20*Math.log10(0.225/nu);};
RF.haversine=window.rfHaversine=function(a,b,c,d){var R=6371000,dl=(c-a)*Math.PI/180,dg=(d-b)*Math.PI/180,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dg/2)*Math.sin(dg/2);return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};

RF.fetchElevations=async function(pts){
  var res=new Array(pts.length).fill(0);
  for(var i=0;i<pts.length;i+=100){
    var b=pts.slice(i,i+100);
    try{
      var r=await fetch('https://api.open-elevation.com/api/v1/lookup',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({locations:b.map(function(p){return{latitude:p.lat,longitude:p.lng};})})});
      if(!r.ok)throw new Error();
      var d=await r.json();
      d.results.forEach(function(v,j){res[i+j]=v.elevation||0;});
    }catch(e){console.warn('[RF] elev error batch '+i);}
    if(i+100<pts.length)await new Promise(r=>setTimeout(r,150));
  }
  return res;
};

RF.generateGrid=function(lat,lng){
  var p=RF.params,ls=p.gridStep/111320,gs=p.gridStep/(111320*Math.cos(lat*Math.PI/180)),n=Math.ceil(p.radius/p.gridStep),pts=[];
  for(var ix=-n;ix<=n;ix++){for(var iy=-n;iy<=n;iy++){var la=lat+ix*ls,lo=lng+iy*gs,dist=RF.haversine(lat,lng,la,lo);if(dist>p.radius||dist<5)continue;pts.push({lat:la,lng:lo,dist:dist,ix:ix,iy:iy});}}
  return pts;
};

// Genera N puntos intermedios entre antena y receptor para el perfil de elevación
RF.profilePoints=function(antLat,antLng,rxLat,rxLng,n){
  var pts=[];
  for(var i=1;i<n-1;i++){
    var f=i/(n-1);
    pts.push({lat:antLat+(rxLat-antLat)*f, lng:antLng+(rxLng-antLng)*f});
  }
  return pts;
};

RF.checkLOS=function(aH,rH,dist,freq,elevs){
  if(!elevs||elevs.length<3)return{loss:0,blocked:false};
  var n=elevs.length,lam=300/freq,maxNu=-999;
  for(var k=1;k<n-1;k++){
    var d1=dist*k/(n-1),d2=dist*(n-1-k)/(n-1);
    var losH=aH+(rH-aH)*k/(n-1); // altura línea recta en ese punto
    var h=elevs[k]-losH;          // cuánto sobresale el obstáculo
    var den=lam*d1*d2/(d1+d2);
    var nu=den>0?h*Math.sqrt(2/den):-999;
    if(nu>maxNu)maxNu=nu;
  }
  var loss=Math.max(0,RF.knifeEdge(maxNu));
  return{loss:loss,blocked:maxNu>0.7};
};

RF.calculate=async function(antLat,antLng,antElev){
  if(RF.working)return null;
  RF.working=true;
  RF.antennaPos={lat:antLat,lng:antLng,elev:antElev};
  var hint=document.getElementById('los-hint');
  hint.style.display='block';
  var p=RF.params;

  // 1. Generar grid de puntos receptores
  hint.textContent='Generant grid RF...';
  var grid=RF.generateGrid(antLat,antLng);

  // 2. Descargar elevaciones de los puntos del grid
  hint.textContent='Descarregant elevació terreny... ('+grid.length+' punts)';
  var gridElevs=await RF.fetchElevations(grid);

  // 3. Descargar edificios OSM para la zona
  hint.textContent='Descarregant edificis OSM...';
  var buildings = [];
  if(typeof RFBuildings !== 'undefined') {
    buildings = await RFBuildings.fetch(antLat, antLng, p.radius);
    hint.textContent='Edificis carregats: ' + buildings.length;
    await new Promise(r=>setTimeout(r,300));
  }

  // 4. Para cada punto, construir perfil de elevación REAL con puntos interpolados
  //    Agrupamos todos los puntos de perfil en un solo batch para minimizar peticiones
  var NSAMPLES=12; // más muestras = mejor detección de obstáculos
  var allProfilePts=[];
  var profileIndex=[]; // para reconstruir qué perfil corresponde a cada punto

  hint.textContent='Preparant perfils de terreny...';
  for(var i=0;i<grid.length;i++){
    var gp=grid[i];
    var prof=RF.profilePoints(antLat,antLng,gp.lat,gp.lng,NSAMPLES+2);
    profileIndex.push({start:allProfilePts.length, count:prof.length});
    allProfilePts=allProfilePts.concat(prof);
  }

  // Descargar todas las elevaciones de perfiles en batch
  hint.textContent='Descarregant perfils... ('+allProfilePts.length+' punts)';
  var allProfileElevs=await RF.fetchElevations(allProfilePts);

  // 4. Calcular rxPower para cada punto
  var aH=antElev+p.txHeight;
  var results=[];
  for(var i=0;i<grid.length;i++){
    var gp=grid[i];
    var rxElev=gridElevs[i]||0;
    var rxH=rxElev+p.rxHeight;
    var dist=gp.dist;

    // Construir perfil completo: [antena, ...intermedios..., receptor]
    var pi=profileIndex[i];
    var elevProfile=[aH];
    for(var j=0;j<pi.count;j++){
      elevProfile.push(allProfileElevs[pi.start+j]||rxElev);
    }
    elevProfile.push(rxH);

    var pl=RF.fspl(dist,p.freq)+RF.clutterLoss(p.environment);
    var los=RF.checkLOS(aH,rxH,dist,p.freq,elevProfile);
    pl+=los.loss;
    // Pérdida real por edificios OSM en la trayectoria
    // Pasamos rxElev para que buildings pueda estimar terreno correctamente
    var buildingLoss = (typeof RFBuildings !== 'undefined' && buildings.length > 0)
      ? RFBuildings.lossPenalty(antLat, antLng, antElev+p.txHeight, gp.lat, gp.lng, rxElev+p.rxHeight, buildings)
      : 0; // Sin buildings: el clutterLoss ya incluye pérdida urbana
    pl += buildingLoss;
    var rxP=p.txPower+p.txGain+p.rxGain-pl;
    results.push({lat:gp.lat,lng:gp.lng,rxPower:rxP,blocked:los.blocked,dist:dist});

    if(i%80===0){
      hint.textContent='Calculant RF... '+Math.round(i/grid.length*100)+'%';
      await new Promise(r=>setTimeout(r,0));
    }
  }

  RF.working=false;
  RF.lastResults=results;
  return results;
};

RF.render=function(results,cv){
  RF.clear(cv);
  if(!cv||!results)return;
  var p=RF.params;
  RF.pointColl=new Cesium.PointPrimitiveCollection();
  results.forEach(function(r){
    var color;
    // Umbrales calculados del rango real: -41 a -72 dBm
    if(r.rxPower>=-48)      {color=new Cesium.Color(0.0,1.0,0.3,0.82);}                                                    // VERDE fuerte
    else if(r.rxPower>=-55) {var t=(r.rxPower+55)/7;color=new Cesium.Color(0.6-t*0.6,0.95,0.0,0.78);}                     // VERDE-AMARILLO
    else if(r.rxPower>=-62) {var t=(r.rxPower+62)/7;color=new Cesium.Color(1.0,0.85-t*0.35,0.0,0.72);}                    // AMARILLO-NARANJA
    else if(r.rxPower>=-70) {var t=(r.rxPower+70)/8;color=new Cesium.Color(1.0,0.3-t*0.3,0.0,0.65);}                      // NARANJA-ROJO
    else if(r.rxPower>=p.rxSens){color=new Cesium.Color(0.85,0.05,0.0,0.58);}                                              // ROJO débil
    else                    {color=new Cesium.Color(0.2,0.2,0.2,0.10);}                                                    // GRIS sin cobertura
    var cart=Cesium.Cartesian3.fromDegrees(r.lng,r.lat,2);
    RF.pointColl.add({position:cart,color:color,pixelSize:6,disableDepthTestDistance:Number.POSITIVE_INFINITY});
  });
  cv.scene.primitives.add(RF.pointColl);
  if(RF.antEntity){try{cv.entities.remove(RF.antEntity);}catch(e){}}
  RF.antEntity=cv.entities.add({
    position:Cesium.Cartesian3.fromDegrees(RF.antennaPos.lng,RF.antennaPos.lat,RF.antennaPos.elev+p.txHeight+5),
    point:{pixelSize:16,color:Cesium.Color.CYAN,outlineColor:Cesium.Color.WHITE,outlineWidth:2},
    label:{text:'📡 '+p.txPower+'dBm · '+p.freq+'MHz',font:'bold 12px Share Tech Mono',fillColor:Cesium.Color.CYAN,outlineColor:Cesium.Color.BLACK,outlineWidth:2,style:Cesium.LabelStyle.FILL_AND_OUTLINE,pixelOffset:new Cesium.Cartesian2(0,-30),disableDepthTestDistance:Number.POSITIVE_INFINITY}
  });
  var leg=document.getElementById('rf-legend');if(leg)leg.style.display='flex';
};

// Versión de calculate que acepta params externos y buildings ya cargados
RF.calculateForNode=async function(antLat,antLng,antElev,params,buildings,hint){
  var savedParams=RF.params;
  RF.params=params;
  RF.antennaPos={lat:antLat,lng:antLng,elev:antElev};
  var p=params;
  hint.textContent='Generant grid...';
  var grid=RF.generateGrid(antLat,antLng);
  hint.textContent='Descarregant elevació... ('+grid.length+' punts)';
  var gridElevs=await RF.fetchElevations(grid);
  var NSAMPLES=12;
  var allProfilePts=[];
  var profileIndex=[];
  for(var i=0;i<grid.length;i++){
    var gp=grid[i];
    var prof=RF.profilePoints(antLat,antLng,gp.lat,gp.lng,NSAMPLES+2);
    profileIndex.push({start:allProfilePts.length,count:prof.length});
    allProfilePts=allProfilePts.concat(prof);
  }
  hint.textContent='Descarregant perfils...';
  var allProfileElevs=await RF.fetchElevations(allProfilePts);
  var aH=antElev+p.txHeight;
  var results=[];
  for(var i=0;i<grid.length;i++){
    var gp=grid[i];
    var rxElev=gridElevs[i]||0;
    var rxH=rxElev+p.rxHeight;
    var dist=gp.dist;
    var pi=profileIndex[i];
    var elevProfile=[aH];
    for(var j=0;j<pi.count;j++) elevProfile.push(allProfileElevs[pi.start+j]||rxElev);
    elevProfile.push(rxH);
    var pl=RF.fspl(dist,p.freq)+RF.clutterLoss(p.environment);
    var los=RF.checkLOS(aH,rxH,dist,p.freq,elevProfile);
    pl+=los.loss;
    var buildingLoss=(typeof RFBuildings!=='undefined'&&buildings&&buildings.length>0)
      ?RFBuildings.lossPenalty(antLat,antLng,antElev+p.txHeight,gp.lat,gp.lng,rxElev+p.rxHeight,buildings):0;
    pl+=buildingLoss;
    var rxP=p.txPower+p.txGain+p.rxGain-pl;
    results.push({lat:gp.lat,lng:gp.lng,rxPower:rxP,blocked:los.blocked,dist:dist});
    if(i%80===0){hint.textContent='Calculant... '+Math.round(i/grid.length*100)+'%';await new Promise(r=>setTimeout(r,0));}
  }
  RF.params=savedParams;
  RF.lastResults=results;
  return results;
};

RF.clear=function(cv){
  if(RF.pointColl&&cv){try{cv.scene.primitives.remove(RF.pointColl);}catch(e){}RF.pointColl=null;}
  if(RF.antEntity&&cv){try{cv.entities.remove(RF.antEntity);}catch(e){}RF.antEntity=null;}
  var leg=document.getElementById('rf-legend');if(leg)leg.style.display='none';
};

})(window);
