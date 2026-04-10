(function(window){
'use strict';

var RFMulti = window.RFMulti = {};

// Colores por nodo (hasta 6 nodos)
RFMulti.NODE_COLORS = [
  { name:'A', hue:'cyan',    strong:[0.0,1.0,0.9], mid:[0.0,0.6,0.8], weak:[0.0,0.3,0.6] },
  { name:'B', hue:'lime',    strong:[0.2,1.0,0.1], mid:[0.4,0.8,0.0], weak:[0.5,0.5,0.0] },
  { name:'C', hue:'magenta', strong:[1.0,0.0,1.0], mid:[0.8,0.0,0.7], weak:[0.5,0.0,0.4] },
  { name:'D', hue:'orange',  strong:[1.0,0.7,0.0], mid:[1.0,0.4,0.0], weak:[0.7,0.2,0.0] },
  { name:'E', hue:'white',   strong:[1.0,1.0,1.0], mid:[0.7,0.7,0.7], weak:[0.4,0.4,0.4] },
  { name:'F', hue:'yellow',  strong:[1.0,1.0,0.0], mid:[0.8,0.8,0.0], weak:[0.5,0.5,0.0] },
];

RFMulti.nodes = [];
RFMulti.linkEntities = []; // líneas de enlace entre nodos
RFMulti.nextId = 0;

// Añadir nodo nuevo
RFMulti.addNode = function(lat, lng, elev, params) {
  var id = RFMulti.nextId++;
  var colorDef = RFMulti.NODE_COLORS[id % RFMulti.NODE_COLORS.length];
  var node = {
    id: id,
    label: colorDef.name,
    lat: lat, lng: lng, elev: elev,
    params: Object.assign({}, params),
    colorDef: colorDef,
    results: null,
    pointColl: null,
    entity: null
  };
  RFMulti.nodes.push(node);
  RFMulti.updateNodeList();
  return node;
};

// Calcular cobertura para un nodo
RFMulti.calculate = async function(node, cesiumViewer) {
  var hint = document.getElementById('los-hint');
  hint.style.display = 'block';
  hint.textContent = '📡 Calculant node ' + node.label + '...';

  // Descargar buildings si no hay cache
  var buildings = [];
  if(typeof RFBuildings !== 'undefined') {
    buildings = await RFBuildings.fetch(node.lat, node.lng, node.params.radius);
  }

  var results = await RFCoverage.calculateForNode(node.lat, node.lng, node.elev, node.params, buildings, hint);
  node.results = results;

  // Renderizar con color del nodo
  RFMulti.renderNode(node, cesiumViewer);

  // Recalcular enlaces entre todos los nodos
  RFMulti.updateLinks(cesiumViewer);

  hint.textContent = '✓ Node ' + node.label + ' calculat — ' + results.length + ' punts';
  setTimeout(function(){ hint.style.display='none'; }, 3000);

  RFMulti.updateNodeList();
  document.getElementById('rf-legend').style.display = 'flex';
};

// Renderizar puntos de un nodo con su color




RFMulti.renderNode = function(node, cv) {
  // Limpiar render anterior de este nodo
  if(node.pointColl && cv) {
    try{ cv.scene.primitives.remove(node.pointColl); }catch(e){}
  }
  if(node.entity && cv) {
    try{ cv.entities.remove(node.entity); }catch(e){}
  }

  var c = node.colorDef;
  var p = node.params;
  node.pointColl = new Cesium.PointPrimitiveCollection();

  // Rango real de rxPower del nodo
  var powers = node.results.map(function(r){return r.rxPower;});
  var maxP = Math.max.apply(null, powers);
  var minP = Math.min.apply(null, powers);
  var rangeP = maxP - minP || 1;

  node.results.forEach(function(r) {
    if(r.rxPower < p.rxSens) return; // sin cobertura — no pintar
    // Normalizar 0..1 donde 1=señal máxima, 0=mínima
    var norm = (r.rxPower - minP) / rangeP;
    // Opacidad: fuerte=0.85, débil=0.25
    var alpha = 0.25 + norm * 0.60;
    // Color del nodo con brillo según señal
    var bright = 0.4 + norm * 0.6;
    var color = new Cesium.Color(
      c.strong[0] * bright,
      c.strong[1] * bright,
      c.strong[2] * bright,
      alpha
    );
    var cart = Cesium.Cartesian3.fromDegrees(r.lng, r.lat, 2);
    node.pointColl.add({position:cart, color:color, pixelSize:6, disableDepthTestDistance:Number.POSITIVE_INFINITY});
  });

  cv.scene.primitives.add(node.pointColl);

  // Marcador de antena con letra del nodo
  node.entity = cv.entities.add({
    position: Cesium.Cartesian3.fromDegrees(node.lng, node.lat, node.elev + p.txHeight + 5),
    point: {
      pixelSize: 18,
      color: new Cesium.Color(c.strong[0], c.strong[1], c.strong[2], 1.0),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2
    },
    label: {
      text: '📡 ' + node.label + ' · ' + p.txPower + 'dBm',
      font: 'bold 12px Share Tech Mono',
      fillColor: new Cesium.Color(c.strong[0], c.strong[1], c.strong[2], 1.0),
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -32),
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    }
  });
};

// Calcular y dibujar enlaces entre nodos
RFMulti.updateLinks = function(cv) {
  // Limpiar enlaces anteriores
  RFMulti.linkEntities.forEach(function(e){ try{ cv.entities.remove(e); }catch(x){} });
  RFMulti.linkEntities = [];

  var nodes = RFMulti.nodes.filter(function(n){ return n.results; });
  if(nodes.length < 2) return;

  for(var i = 0; i < nodes.length; i++) {
    for(var j = i+1; j < nodes.length; j++) {
      var a = nodes[i], b = nodes[j];
      var link = RFMulti.checkLink(a, b);

      var color = link.connected
        ? new Cesium.Color(0.0, 1.0, 0.4, 0.9)   // verde = enlace OK
        : new Cesium.Color(1.0, 0.2, 0.0, 0.7);   // rojo = sin enlace

      var posA = Cesium.Cartesian3.fromDegrees(a.lng, a.lat, a.elev + a.params.txHeight + 5);
      var posB = Cesium.Cartesian3.fromDegrees(b.lng, b.lat, b.elev + b.params.txHeight + 5);

      // Línea entre nodos
      var lineEnt = cv.entities.add({
        polyline: {
          positions: [posA, posB],
          width: link.connected ? 3 : 1.5,
          material: new Cesium.ColorMaterialProperty(color),
          clampToGround: false,
          arcType: Cesium.ArcType.NONE
        }
      });
      RFMulti.linkEntities.push(lineEnt);

      // Etiqueta en el centro del enlace
      var midLat = (a.lat + b.lat) / 2;
      var midLng = (a.lng + b.lng) / 2;
      var midH   = (a.elev + b.elev) / 2 + 20;
      var labelEnt = cv.entities.add({
        position: Cesium.Cartesian3.fromDegrees(midLng, midLat, midH),
        label: {
          text: (link.connected ? '✓ ' : '✗ ') + a.label + '↔' + b.label + '\n' + link.rxPower.toFixed(1) + ' dBm',
          font: 'bold 10px Share Tech Mono',
          fillColor: color,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          pixelOffset: new Cesium.Cartesian2(0, 0)
        }
      });
      RFMulti.linkEntities.push(labelEnt);
    }
  }
};

// Calcular si dos nodos se pueden ver entre sí
RFMulti.checkLink = function(nodeA, nodeB) {
  // Buscar en los resultados de A si el punto más cercano a B tiene señal
  var best = -999;
  if(nodeA.results) {
    nodeA.results.forEach(function(r) {
      var dlat = r.lat - nodeB.lat, dlng = r.lng - nodeB.lng;
      var d = Math.sqrt(dlat*dlat + dlng*dlng);
      if(d < 0.001 && r.rxPower > best) best = r.rxPower; // ~100m
    });
  }
  // También buscar desde B hacia A
  if(nodeB.results) {
    nodeB.results.forEach(function(r) {
      var dlat = r.lat - nodeA.lat, dlng = r.lng - nodeA.lng;
      var d = Math.sqrt(dlat*dlat + dlng*dlng);
      if(d < 0.001 && r.rxPower > best) best = r.rxPower;
    });
  }
  // Si no encontramos punto cercano, calcular con FSPL directo
  if(best === -999) {
    var dist = RFCoverage.haversine ? RFCoverage.haversine(nodeA.lat,nodeA.lng,nodeB.lat,nodeB.lng) :
      6371000*2*Math.atan2(Math.sqrt(Math.pow(Math.sin((nodeB.lat-nodeA.lat)*Math.PI/360),2)),1);
    var p = nodeA.params;
    var fspl = 32.45 + 20*Math.log10(p.freq) + 20*Math.log10(dist/1000);
    best = p.txPower + p.txGain + nodeB.params.rxGain - fspl;
  }
  return {
    connected: best >= nodeA.params.rxSens,
    rxPower: best
  };
};

// Limpiar nodo individual
RFMulti.removeNode = function(id, cv) {
  var idx = RFMulti.nodes.findIndex(function(n){ return n.id===id; });
  if(idx === -1) return;
  var node = RFMulti.nodes[idx];
  if(node.pointColl && cv) try{ cv.scene.primitives.remove(node.pointColl); }catch(e){}
  if(node.entity && cv)    try{ cv.entities.remove(node.entity); }catch(e){}
  RFMulti.nodes.splice(idx, 1);
  RFMulti.updateLinks(cv);
  RFMulti.updateNodeList();
  if(RFMulti.nodes.length === 0) document.getElementById('rf-legend').style.display = 'none';
};

// Limpiar todo
RFMulti.clearAll = function(cv) {
  RFMulti.nodes.forEach(function(node){
    if(node.pointColl && cv) try{ cv.scene.primitives.remove(node.pointColl); }catch(e){}
    if(node.entity && cv)    try{ cv.entities.remove(node.entity); }catch(e){}
  });
  RFMulti.linkEntities.forEach(function(e){ try{ cv.entities.remove(e); }catch(x){} });
  RFMulti.nodes = [];
  RFMulti.linkEntities = [];
  RFMulti.nextId = 0;
  RFMulti.updateNodeList();
  document.getElementById('rf-legend').style.display = 'none';
};

// Actualizar lista de nodos en el panel Y en la leyenda del mapa
RFMulti.updateNodeList = function() {
  // Actualizar leyenda del mapa
  var legNodes = document.getElementById('rf-legend-nodes');
  if(legNodes) {
    if(RFMulti.nodes.length === 0) {
      legNodes.innerHTML = '';
    } else {
      legNodes.innerHTML = RFMulti.nodes.map(function(n){
        var c = n.colorDef;
        var rgb = 'rgb('+Math.round(c.strong[0]*255)+','+Math.round(c.strong[1]*255)+','+Math.round(c.strong[2]*255)+')';
        var powers = n.results ? n.results.map(function(r){return r.rxPower;}) : [];
        var maxP = powers.length ? Math.max.apply(null,powers).toFixed(0) : '?';
        var minP = powers.length ? Math.min.apply(null,powers).toFixed(0) : '?';
        return '<div style="display:flex;align-items:center;gap:6px;">'+
          '<div style="width:12px;height:12px;border-radius:50%;background:'+rgb+';flex-shrink:0;"></div>'+
          '<span style="color:'+rgb+';font-weight:bold;">'+n.label+'</span>'+
          '<span style="color:rgba(0,229,255,.4);font-size:8px;margin-left:2px;">'+minP+'→'+maxP+' dBm</span>'+
        '</div>';
      }).join('');
    }
  }

  var el = document.getElementById('rf-node-list');
  if(!el) return;
  if(RFMulti.nodes.length === 0) {
    el.innerHTML = '<div style="color:rgba(0,229,255,.3);font-size:9px;text-align:center;padding:8px;">Cap node calculat</div>';
    return;
  }
  el.innerHTML = RFMulti.nodes.map(function(n) {
    var c = n.colorDef;
    var rgb = 'rgb('+Math.round(c.strong[0]*255)+','+Math.round(c.strong[1]*255)+','+Math.round(c.strong[2]*255)+')';
    return '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(0,229,255,.08);">' +
      '<span style="width:12px;height:12px;border-radius:50%;background:'+rgb+';flex-shrink:0;"></span>' +
      '<span style="color:'+rgb+';font-weight:bold;">'+n.label+'</span>' +
      '<span style="color:rgba(0,229,255,.5);font-size:8px;flex:1;">'+n.lat.toFixed(4)+', '+n.lng.toFixed(4)+'</span>' +
      '<span style="color:rgba(0,229,255,.4);font-size:8px;">'+n.params.txPower+'dBm</span>' +
      '<button onclick="RFMulti.removeNode('+n.id+',cesiumViewer)" style="background:rgba(255,50,50,.15);border:1px solid rgba(255,50,50,.3);color:#ff5555;padding:2px 5px;font-size:8px;cursor:pointer;font-family:inherit;">✕</button>' +
    '</div>';
  }).join('');
};

})(window);