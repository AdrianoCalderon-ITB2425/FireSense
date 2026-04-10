// ── UI / DOM UPDATES ───────────────────────────────────────
function updateNodeButtons(){
  for(var j=0;j<5;j++){
    var btn=document.getElementById('nb'+j);if(!btn)continue;
    btn.className='nbtn'+(j===selIdx?' active':NODES[j].deployed?'':' off');
  }
}

function selNode(i){
  selIdx=i;updateNodeButtons();updateNextTxCountdown();
  var d=nodeData[i],cfg=NODES[i];
  var titleEl=document.getElementById('liveCardTitle');
  var cardBorder=document.getElementById('liveCardBorder');
  var rEl=document.getElementById('riskSt');
  document.getElementById('histLbl').textContent=cfg.id;
  document.getElementById('nodeCoords').textContent=cfg.lat.toFixed(6)+', '+cfg.lng.toFixed(6);

  if(!d||d.temp===null||d.status==='waiting'){
    document.getElementById('mainT').textContent='—';
    document.getElementById('mainH').textContent='—';
    document.getElementById('mainS').textContent='—';
    rEl.textContent='—';rEl.style.color=txtColor();rEl.style.textShadow='none';
    document.getElementById('fCnt').textContent='—';
    var batEl2=document.getElementById('batPct');
    batEl2.textContent='—';batEl2.style.color=txtColor();
    document.getElementById('lastSeen').textContent='—';
    document.getElementById('histList').innerHTML='<div class="hrow" style="font-style:italic;"><span>'+(cfg.deployed?'Esperant primera dada...':'Pendent desplegament')+'</span></div>';
    titleEl.innerHTML='<div class="stale-dot"></div>DADES EN ESPERA';
    titleEl.className='card-title ct-s';
    cardBorder.className='card card-l-stale stale-card';
    return;
  }

  var tEl=document.getElementById('mainT');
  tEl.textContent=d.temp.toFixed(1);tEl.className='mbig-val vt'+(d.temp>40?' hot':'');
  document.getElementById('mainH').textContent=d.hum!==null?d.hum.toFixed(1):'—';
  var sEl=document.getElementById('mainS');
  sEl.textContent=d.soil!==null?d.soil:'—';
  sEl.className='mmini-val vs'+(d.soil!==null&&d.soil<15?' dry':'');
  document.getElementById('fCnt').textContent=d.fCnt||'—';
  document.getElementById('lastSeen').textContent=timeSince(d.rawTime)||d.time||'—';

  var batEl=document.getElementById('batPct');
  if(d.bat_pct!==null){
    var batV=(d.bat_mv?(d.bat_mv/1000).toFixed(2)+'V':'—');
    batEl.textContent=d.bat_pct+'% ('+batV+')';
    batEl.style.color=batColor(d.bat_pct);
  } else {
    batEl.textContent='—';batEl.style.color=txtColor();
  }

  if(d.status==='offline'){
    rEl.textContent='○ OFFLINE (MEMÒRIA)';rEl.style.color=offlineColor();rEl.style.textShadow='none';
    titleEl.innerHTML='<div class="stale-dot"></div>DADES RETARDADES';
    titleEl.className='card-title ct-s';
    cardBorder.className='card card-l-stale stale-card';
  } else {
    if(d.temp>40){
      rEl.textContent='⚠ RISC CRÍTIC';rEl.style.color='var(--red)';
      cardBorder.className='card card-l-red';
    } else if(d.temp>35||(d.soil!==null&&d.soil<15)){
      rEl.textContent='⚠ RISC MODERAT';rEl.style.color='var(--amber)';
      cardBorder.className='card card-l-amber';
    } else {
      rEl.textContent='✓ NORMAL';rEl.style.color='var(--green)';
      cardBorder.className='card card-l-green';
    }
    rEl.style.textShadow='';
    titleEl.innerHTML='<div class="live-dot"></div>DADES EN VIU';
    titleEl.className='card-title ct-g';
  }

  var h=d.history||[];
  document.getElementById('histList').innerHTML=h.length
    ?h.slice(0,24).map(function(r){
      var batStr=r.bat_pct!=null?(r.bat_pct+'% ('+(r.bat_mv?(r.bat_mv/1000).toFixed(2)+'V':'—')+')'):'—';
      var batCol=r.bat_pct!=null?(r.bat_pct>50?'var(--green)':r.bat_pct>20?'var(--amber)':'var(--red)'):'var(--txt3)';
      return '<div class="hrow" style="justify-content:space-between;">'+
        '<span style="color:var(--cyan);font-size:11px;font-weight:600;min-width:36px;">'+r.time+'</span>'+
        '<div style="display:flex;gap:6px;">'+
        '<span class="ht">'+(r.temp!==null?r.temp.toFixed(1):'—')+'°C</span>'+
        '<span class="hh">'+(r.hum!==null?(typeof r.hum==='number'?r.hum.toFixed(0):r.hum):'—')+'%</span>'+
        '<span class="hs">'+(r.soil!==null?r.soil:'—')+'%</span>'+
        '</div>'+
        '<span style="color:'+batCol+';font-size:10.5px;min-width:80px;text-align:right;">'+batStr+'</span>'+
        '</div>';
    }).join('')
    :'<div class="hrow"><span style="color:var(--txt3);">Sense historial</span></div>';
}

function checkAlerts(){
  var crit=nodeData.filter(function(d){return d&&d.temp>40&&d.status==='online';});
  var warn=nodeData.filter(function(d){return d&&d.temp>35&&d.temp<=40&&d.status==='online';});
  var box=document.getElementById('alertBox');
  if(crit.length){
    box.classList.add('on');
    box.querySelector('.alert-ttl').textContent="⚠ ALERTA RISC D'INCENDI";
    box.querySelector('.alert-ttl').style.color='var(--red)';
    document.getElementById('alertMsg').textContent="Temperatura crítica! Risc d'incendi imminent.";
  } else if(warn.length){
    box.classList.add('on');
    box.querySelector('.alert-ttl').textContent='⚠ RISC MODERAT';
    box.querySelector('.alert-ttl').style.color='var(--amber)';
    document.getElementById('alertMsg').textContent='Temperatura elevada detectada.';
  } else {box.classList.remove('on');}
}

function renderGrid(){
  document.getElementById('sgrid').innerHTML=NODES.map(function(cfg,i){
    var d=nodeData[i];
    var hasData=d&&d.temp!==null;
    var online=d&&d.status==='online'&&isOnline(d.rawTime);
    if(!hasData)return '<div class="scard card-l-stale stale-card">'+
      '<div class="sacc" style="background:rgba(128,128,128,.2);box-shadow:none;"></div>'+
      '<div class="shdr"><span class="sid" style="color:var(--txt2)">'+cfg.id+'</span>'+
      '<span class="sst" style="color:var(--txt3)"><span class="sdot stale-dot"></span>'+(cfg.deployed?'SENSE DADES':'PENDENT')+'</span></div>'+
      '<div class="svals">'+['Temp','Hum.Aire','Hum.Sòl'].map(function(l){
        return '<div class="sv"><div class="svl">'+l+'</div><div class="svn" style="color:var(--txt3);font-size:1.6rem;">—</div></div>';
      }).join('')+'</div>'+
      '<div class="sftr"><span>'+(cfg.deployed?'Esperant paquets...':'Pendent desplegament')+'</span></div></div>';

    var isCrit=d.temp>40,isWarn=d.temp>35||(d.soil!==null&&d.soil<15);
    var acc=isCrit?'var(--red)':isWarn?'var(--amber)':'var(--green)';
    var accHex=isCrit?'#ff1744':isWarn?'#ffab40':'#00ff88';
    var cardClass=online?'':'stale-card';
    return '<div class="scard '+cardClass+'">'+
      '<div class="sacc" style="background:'+(online?acc:'rgba(128,128,128,.2)')+';box-shadow:'+(online?(isCrit?'0 0 4px #ff1744,0 0 12px #ff1744,0 0 28px rgba(255,23,68,.5)':isWarn?'0 0 4px #ffab40,0 0 12px #ffab40,0 0 28px rgba(255,171,64,.5)':'0 0 4px #00ff88,0 0 12px #00ff88,0 0 28px rgba(0,255,136,.5)'):'none')+'"></div>'+
      '<div class="shdr">'+
      '<span class="sid" style="color:'+(online?acc:'var(--txt2)')+'">'+cfg.id+'</span>'+
      '<span class="sst" style="color:'+(online?acc:'var(--txt3)')+'"><span class="sdot" style="background:'+(online?accHex:'rgba(128,128,128,.3)')+';box-shadow:'+(online?(isCrit?'0 0 4px #ff1744,0 0 12px #ff1744,0 0 24px rgba(255,23,68,.5)':isWarn?'0 0 4px #ffab40,0 0 12px #ffab40,0 0 24px rgba(255,171,64,.5)':'0 0 4px #00ff88,0 0 12px #00ff88,0 0 24px rgba(0,255,136,.5)'):'none')+';animation:'+(online?'blink 1.4s ease-in-out infinite':'none')+'"></span>'+(online?'ONLINE':'OFFLINE')+'</span></div>'+
      '<div class="svals">'+
      '<div class="sv"><div class="svl">Temp</div><div class="svn '+(isCrit?'vt hot':'vt')+'">'+d.temp.toFixed(1)+'</div><div class="svu">°C</div></div>'+
      '<div class="sv"><div class="svl">Hum.Aire</div><div class="svn vh">'+(d.hum!==null?d.hum.toFixed(0):'—')+'</div><div class="svu">%</div></div>'+
      '<div class="sv"><div class="svl">Hum.Sòl</div><div class="svn '+(d.soil!==null&&d.soil<15?'vs dry':'vs')+'">'+(d.soil!==null?d.soil:'—')+'</div><div class="svu">%</div></div>'+
      '</div>'+
      '<div class="sftr">'+
      '<span class="srisk" style="color:'+(online?acc:'var(--txt3)')+'">'+(online?'':'○ MEMÒRIA · ')+(isCrit?'⚠ CRÍTIC':isWarn?'⚠ MODERAT':'✓ NORMAL')+'</span>'+
      '<span>'+timeSince(d.rawTime)+'</span>'+
      '<span>FC:'+(d.fCnt||'—')+'</span>'+
      '</div></div>';
  }).join('');
}

function updateNextTxCountdown(){
  var d=nodeData[selIdx],el=document.getElementById('nextTx');if(!el)return;
  if(!d||d.temp===null||!d.rawTime){el.textContent='—';el.style.color=txtColor();el.style.textShadow='';return;}
  var remaining=OFFLINE_MS-(Date.now()-new Date(d.rawTime).getTime());
  if(remaining<=0){
    el.textContent='○ DESCONNECTAT / RETARDAT';el.style.color=offlineColor();el.style.textShadow='none';return;
  }
  el.style.textShadow='';
  var mins=Math.floor(remaining/60000),secs=Math.floor((remaining%60000)/1000);
  el.textContent='en '+mins+'m '+secs.toString().padStart(2,'0')+'s';
  el.style.color=mins<2?'var(--amber)':mins<10?'var(--cyan)':'var(--txt3)';
}

function updateAllColors(){
  selNode(selIdx);
  updateMapMarkers();
  updateNextTxCountdown();
  NODES.forEach(function(_,i){updateNodePopup(i);});
  renderGrid();
}

function showToolInfo(data){
  // placeholder - reservat per futures eines
}
