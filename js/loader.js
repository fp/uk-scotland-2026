(function(){
  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }

  async function fetchText(url){
    var res = await fetch(url, {cache: 'no-cache'});
    if(!res.ok) throw new Error('Failed to load ' + url + ': ' + res.status);
    return res.text();
  }

  async function main(){
    var wrap = document.querySelector('.wrap');
    var footer = document.querySelector('.wrap > footer');
    if(!wrap || !footer) return;

    var manifest = JSON.parse(await fetchText('pages/manifest.json'));

    // Fetch every referenced fragment file in parallel up front.
    var files = manifest.filter(function(i){ return i.file; }).map(function(i){ return i.file; });
    var texts = {};
    await Promise.all(files.map(function(f){
      return fetchText(f).then(function(t){ texts[f] = t; });
    }));

    var currentTimeline = null;
    manifest.forEach(function(item){
      if(item.type === 'section'){
        wrap.insertBefore(el('div', 'section-label', item.label), footer);
        currentTimeline = el('div', 'timeline');
        wrap.insertBefore(currentTimeline, footer);
      } else if(item.type === 'day'){
        var tmp = document.createElement('div');
        tmp.innerHTML = texts[item.file];
        while(tmp.firstChild) currentTimeline.appendChild(tmp.firstChild);
      } else if(item.type === 'raw'){
        var tmp2 = document.createElement('div');
        tmp2.innerHTML = texts[item.file];
        while(tmp2.firstChild) wrap.insertBefore(tmp2.firstChild, footer);
      }
    });

    if(window.initMaps) window.initMaps();
    if(window.initDayNav) window.initDayNav();
    if(window.initWeather) window.initWeather();
  }

  function start(){
    main().catch(function(err){
      console.error('Failed to load itinerary content:', err);
      var wrap = document.querySelector('.wrap');
      if(wrap){
        var msg = document.createElement('p');
        msg.style.color = '#b06a17';
        msg.textContent = 'Something went wrong loading the itinerary content. Please refresh, or check your connection.';
        wrap.insertBefore(msg, wrap.firstChild);
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
