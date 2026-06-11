var BASE='https://raw.githubusercontent.com/gounpark/yeokyang-notes/main/src/';
var SRC_LABELS={kim:'김영숙',jung:'정기홍',lim:'임은영',jy:'김지영',lec:'조은희 강사'};
var cache={};

function switchPage(btn,pgId){
  document.querySelectorAll('.page-tab').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.page-section').forEach(function(s){s.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById(pgId).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

function switchSub(btn,tabId){
  var pg=btn.closest('.page-section');
  pg.querySelectorAll('.subtab').forEach(function(b){b.classList.remove('active');});
  pg.querySelectorAll('.subcontent').forEach(function(c){c.style.display='none';});
  btn.classList.add('active');
  document.getElementById(tabId).style.display='block';
}

function getContext(fullText,quote){
  var q=quote.replace(/&quot;/g,'"').replace(/&amp;/g,'&').trim();
  var blocks=fullText.split(/\n\n+/);
  var kw=q.replace(/[\u201c\u201d"]/g,'').slice(0,20).trim();
  var found=-1;
  for(var i=0;i<blocks.length;i++){
    if(blocks[i].indexOf(kw)!==-1){found=i;break;}
  }
  if(found===-1){
    kw=q.replace(/[\u201c\u201d"]/g,'').slice(0,10).trim();
    for(var i=0;i<blocks.length;i++){
      if(blocks[i].indexOf(kw)!==-1){found=i;break;}
    }
  }
  return{blocks:blocks,found:found,start:Math.max(0,found-4),end:Math.min(blocks.length-1,found===-1?8:found+4)};
}

function renderContext(result,body){
  body.innerHTML='';
  var s=result.found===-1?0:result.start;
  var e=result.end;
  for(var i=s;i<=e;i++){
    var b=result.blocks[i];
    if(!b.trim())continue;
    var d=document.createElement('div');
    d.style.cssText='padding:7px 10px;border-radius:6px;margin-bottom:4px;font-size:12px;line-height:1.8;white-space:pre-wrap;font-family:inherit';
    if(i===result.found){
      d.style.cssText+=';background:#fefce8;border:1.5px solid #d4b800;color:#111;font-weight:500';
    } else {
      d.style.color='#888';
    }
    d.textContent=b;
    body.appendChild(d);
  }
  var mb=document.createElement('button');
  mb.className='ctx-btn';
  mb.textContent='전체 원문 보기 ↓';
  mb.style.cssText='margin-top:8px;width:100%;text-align:center;display:block';
  mb.addEventListener('click',function(e){
    e.stopPropagation();
    body.innerHTML='';
    for(var i=0;i<result.blocks.length;i++){
      var b=result.blocks[i];
      if(!b.trim())continue;
      var d=document.createElement('div');
      d.style.cssText='padding:7px 10px;border-radius:6px;margin-bottom:4px;font-size:12px;line-height:1.8;white-space:pre-wrap;font-family:inherit';
      if(i===result.found){
        d.style.cssText+=';background:#fefce8;border:1.5px solid #d4b800;color:#111;font-weight:500';
      } else {
        d.style.color='#888';
      }
      d.textContent=b;
      body.appendChild(d);
    }
  });
  body.appendChild(mb);
}

function initHL(){
  document.querySelectorAll('.hl').forEach(function(el){
    el.addEventListener('click',function(e){
      e.stopPropagation();
      var key=el.getAttribute('data-key');
      var name=el.getAttribute('data-name');
      var quote=el.getAttribute('data-quote');
      var color=el.style.color;
      var container=el.closest('.item-text')||el.closest('.pcard-note');
      if(!container)return;
      var box=container.querySelector('.quote-box');
      if(!box)return;
      var isOpen=(box.style.display==='block');
      document.querySelectorAll('.quote-box').forEach(function(b){b.style.display='none';b.innerHTML='';});
      if(isOpen)return;
      var hdr=document.createElement('div');hdr.className='quote-box-hdr';
      var qn=document.createElement('span');qn.className='q-name';qn.style.color=color;qn.textContent=name;
      var cb=document.createElement('button');cb.className='ctx-btn';cb.textContent='원문에서 보기';
      hdr.appendChild(qn);hdr.appendChild(cb);
      var qt=document.createElement('div');qt.className='q-text';
      qt.textContent='\u201c'+quote.replace(/&quot;/g,'"')+'\u201d';
      var panel=document.createElement('div');panel.className='full-panel';panel.style.display='none';
      var ph=document.createElement('div');ph.className='full-panel-hdr';
      var pt=document.createElement('span');pt.className='full-panel-title';pt.textContent=SRC_LABELS[key]||key;
      var closeB=document.createElement('button');closeB.className='close-btn';closeB.textContent='\u2715';
      closeB.addEventListener('click',function(e2){e2.stopPropagation();panel.style.display='none';});
      ph.appendChild(pt);ph.appendChild(closeB);
      var pb=document.createElement('div');pb.className='full-panel-body';
      panel.appendChild(ph);panel.appendChild(pb);
      box.innerHTML='';box.appendChild(hdr);box.appendChild(qt);box.appendChild(panel);
      box.style.display='block';
      cb.addEventListener('click',function(e2){
        e2.stopPropagation();
        if(panel.style.display==='block'){panel.style.display='none';return;}
        panel.style.display='block';
        if(cache[key]){renderContext(getContext(cache[key],quote),pb);return;}
        pb.textContent='불러오는 중...';
        fetch(BASE+key+'.txt')
          .then(function(r){return r.text();})
          .then(function(t){cache[key]=t;renderContext(getContext(t,quote),pb);})
          .catch(function(){pb.textContent='원문을 불러올 수 없습니다.';});
      });
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.hl')&&!e.target.closest('.quote-box')){
      document.querySelectorAll('.quote-box').forEach(function(b){b.style.display='none';b.innerHTML='';});
    }
  });
}

// ── 검색 ──
var searchData=[];

function getSlabel(el){
  var b=el.closest('.s-block');
  return (b&&b.querySelector('.s-label'))?b.querySelector('.s-label').textContent.trim():'';
}

function buildSearchIndex(){
  searchData=[];
  var pgLabels={
    'pg-review':'전체 정리','pg-kim':'김영숙','pg-jung':'정기홍',
    'pg-lim':'임은영','pg-jy':'김지영','pg-lec':'조은희 강사'
  };
  var hidden=[];
  document.querySelectorAll('.subcontent').forEach(function(el){
    if(el.style.display==='none'){
      hidden.push(el);
      el.style.display='block';
      el.style.visibility='hidden';
    }
  });
  document.querySelectorAll('.page-section').forEach(function(pg){
    var pgId=pg.id;
    var pgLabel=pgLabels[pgId]||pgId;
    var subs=pg.querySelectorAll('.subcontent');
    if(subs.length===0){
      pg.querySelectorAll('.item').forEach(function(item){addItem(item,pgId,pgLabel,'','',null);});
      pg.querySelectorAll('.pcard').forEach(function(card){addPcard(card,pgId,pgLabel,'','',null);});
    } else {
      subs.forEach(function(sub){
        var subId=sub.id;
        var subBtn=pg.querySelector('[data-tab="'+subId+'"]');
        var subLabel=subBtn?subBtn.textContent.trim():'';
        sub.querySelectorAll('.item').forEach(function(item){addItem(item,pgId,pgLabel,subId,subLabel,sub);});
        sub.querySelectorAll('.pcard').forEach(function(card){addPcard(card,pgId,pgLabel,subId,subLabel,sub);});
      });
    }
  });
  hidden.forEach(function(el){el.style.display='none';el.style.visibility='';});
}

function addItem(item,pgId,pgLabel,subId,subLabel,subEl){
  var textEl=item.querySelector('.item-text');
  if(!textEl)return;
  var clone=textEl.cloneNode(true);
  clone.querySelectorAll('.hl,.quote-box').forEach(function(e){e.remove();});
  var text=clone.textContent.trim();
  if(!text)return;
  searchData.push({text:text,pgId:pgId,pgLabel:pgLabel,subId:subId,subLabel:subLabel,sLabel:getSlabel(item),el:item,subEl:subEl});
}

function addPcard(card,pgId,pgLabel,subId,subLabel,subEl){
  var title=card.querySelector('.pcard-title')?card.querySelector('.pcard-title').textContent.trim():'';
  var badge=card.querySelector('.pcard-badge')?card.querySelector('.pcard-badge').textContent.trim():'';
  card.querySelectorAll('.pcard-item').forEach(function(pi){
    var text=pi.textContent.trim();
    if(!text)return;
    searchData.push({text:'['+badge+'] '+title+' — '+text,pgId:pgId,pgLabel:pgLabel,subId:subId,subLabel:subLabel,sLabel:getSlabel(card),el:card,subEl:subEl});
  });
}

function doSearch(q){
  var keywords=q.toLowerCase().split(/\s+/).filter(Boolean);
  var results=searchData.filter(function(d){
    return keywords.every(function(kw){return d.text.toLowerCase().indexOf(kw)!==-1;});
  });
  var container=document.getElementById('search-results');
  var countEl=document.getElementById('search-count');
  container.classList.add('show');
  while(container.children.length>1)container.removeChild(container.lastChild);
  document.querySelectorAll('.item.search-highlight').forEach(function(el){el.classList.remove('search-highlight');});
  if(results.length===0){
    countEl.textContent='검색 결과 없음';
    var empty=document.createElement('div');empty.className='search-empty';
    empty.textContent='"'+q+'" 에 해당하는 내용이 없어요';
    container.appendChild(empty);
    return;
  }
  countEl.textContent=results.length+'개 항목 발견';
  results.slice(0,30).forEach(function(d){
    var card=document.createElement('div');card.className='search-result-item';
    var tag=document.createElement('div');tag.className='search-result-tag';
    tag.textContent=[d.pgLabel,d.subLabel,d.sLabel].filter(Boolean).join(' › ');
    var txt=document.createElement('div');txt.className='search-result-text';
    var hi=d.text;
    keywords.forEach(function(kw){
      var re=new RegExp('('+kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
      hi=hi.replace(re,'<mark>$1</mark>');
    });
    txt.innerHTML=hi;
    card.appendChild(tag);card.appendChild(txt);
    card.addEventListener('click',function(){
      var pgBtn=null;
      document.querySelectorAll('.page-tab').forEach(function(b){
        if(b.getAttribute('onclick')&&b.getAttribute('onclick').indexOf(d.pgId)!==-1)pgBtn=b;
      });
      if(pgBtn)pgBtn.click();
      setTimeout(function(){
        if(d.subId){
          var subBtn=document.querySelector('[data-tab="'+d.subId+'"]');
          if(subBtn)subBtn.click();
        }
        setTimeout(function(){
          if(d.el){
            d.el.classList.add('search-highlight');
            d.el.scrollIntoView({behavior:'smooth',block:'center'});
          }
        },150);
      },100);
    });
    container.appendChild(card);
  });
  if(results.length>30){
    var more=document.createElement('div');more.className='search-empty';
    more.textContent='+ '+(results.length-30)+'개 더 있음';
    container.appendChild(more);
  }
}

function clearSearch(){
  var input=document.getElementById('search-input');
  if(input)input.value='';
  var icon=document.getElementById('search-icon');
  var clr=document.getElementById('search-clear');
  if(icon)icon.style.display='block';
  if(clr)clr.style.display='none';
  var container=document.getElementById('search-results');
  container.classList.remove('show');
  while(container.children.length>1)container.removeChild(container.lastChild);
  document.querySelectorAll('.item.search-highlight').forEach(function(el){el.classList.remove('search-highlight');});
}

function toggleToc(){document.getElementById('toc-panel').classList.toggle('open');}
function closeToc(){document.getElementById('toc-panel').classList.remove('open');}

document.addEventListener('DOMContentLoaded',function(){
  initHL();
  document.querySelectorAll('.subtab[data-tab]').forEach(function(btn){
    btn.addEventListener('click',function(){switchSub(btn,btn.getAttribute('data-tab'));});
  });
  var input=document.getElementById('search-input');
  if(input){
    input.addEventListener('input',function(){
      var q=input.value.trim();
      if(q){
        document.getElementById('search-icon').style.display='none';
        document.getElementById('search-clear').style.display='block';
        doSearch(q);
      } else { clearSearch(); }
    });
    input.addEventListener('keydown',function(e){if(e.key==='Escape')clearSearch();});
  }
  document.addEventListener('click',function(e){
    if(!e.target.closest('#toc-btn')&&!e.target.closest('#toc-panel')){
      document.getElementById('toc-panel').classList.remove('open');
    }
  });
  setTimeout(buildSearchIndex,600);
});
