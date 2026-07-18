(function(){
  function openHistory(id){
    var entry = (window.HISTORY_ENTRIES || []).filter(function(e){ return e.id === id; })[0];
    var overlay = document.getElementById('historyOverlay');
    var content = document.getElementById('historyOverlayContent');
    if(!entry || !overlay || !content) return;
    content.innerHTML = '<h1>' + entry.title + '</h1>' +
      '<p class="history-meta">' + (entry.tags || []).join(' · ') + '</p>' +
      entry.html;
    overlay.classList.add('open');
    document.documentElement.classList.add('lb-lock');
    var scrollEl = overlay.querySelector('.history-panel-scroll');
    if(scrollEl) scrollEl.scrollTop = 0;
  }

  function closeHistory(){
    var overlay = document.getElementById('historyOverlay');
    if(overlay) overlay.classList.remove('open');
    document.documentElement.classList.remove('lb-lock');
  }

  document.addEventListener('click', function(e){
    var link = e.target.closest && e.target.closest('.history-link, .history-inline-link');
    if(link && link.dataset && link.dataset.historyId){
      e.preventDefault();
      openHistory(link.dataset.historyId);
      return;
    }
    if(e.target.id === 'historyClose'){
      closeHistory();
      return;
    }
    if(e.target.id === 'historyOverlay'){
      closeHistory();
    }
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      var overlay = document.getElementById('historyOverlay');
      if(overlay && overlay.classList.contains('open')) closeHistory();
    }
  });

  window.initHistory = function(){
    var entries = window.HISTORY_ENTRIES || [];

    var listEl = document.getElementById('historyList');
    if(listEl){
      listEl.innerHTML = entries.map(function(entry){
        var tags = (entry.locations || []).map(function(l){ return '<span class="history-tag">' + l + '</span>'; }).join('');
        return '<div class="history-item">' +
          '<h3>' + entry.title + '</h3>' +
          '<p>' + entry.summary + '</p>' +
          '<div class="history-tags">' + tags + '</div>' +
          '<a href="javascript:void(0)" class="history-link" data-history-id="' + entry.id + '">Read full guide →</a>' +
          '</div>';
      }).join('');
    }

    var dayPlaceholders = document.querySelectorAll('.day-history[data-history-day]');
    dayPlaceholders.forEach(function(el){
      var dayNum = parseInt(el.getAttribute('data-history-day'), 10);
      var matches = entries.filter(function(entry){ return (entry.dayLinks || []).indexOf(dayNum) !== -1; });
      if(!matches.length) return;
      el.innerHTML = matches.map(function(entry){
        var linkHtml = '<a href="javascript:void(0)" class="history-inline-link" data-history-id="' + entry.id + '">📜 ' + entry.title + ' →</a>';
        var items = (entry.daySummaries && entry.daySummaries[dayNum]) || [];
        var summaryHtml = items.length ? ('<ul class="day-history-summary">' + items.map(function(t){ return '<li>' + t + '</li>'; }).join('') + '</ul>') : '';
        return '<div class="day-history-block">' + linkHtml + summaryHtml + '</div>';
      }).join('');
    });
  };
})();
