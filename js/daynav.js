window.initDayNav = function(){
  var prevBtn = document.getElementById('prevDay');
  var nextBtn = document.getElementById('nextDay');
  var jumpSel = document.getElementById('dayJump');
  var numEl = document.getElementById('dayNavNum');
  var dateEl = document.getElementById('dayNavDate');
  if(!prevBtn || !nextBtn || !jumpSel || !numEl || !dateEl) return;

  var days = [];
  var nodes = document.querySelectorAll('.wrap > .section-label, .wrap > .timeline');
  var currentSection = '';
  nodes.forEach(function(node){
    if(node.classList.contains('section-label')){
      currentSection = node.textContent.trim();
      if(node.nextElementSibling && node.nextElementSibling.classList.contains('timeline')){
        node.classList.add('day-section-label');
      }
    } else if(node.classList.contains('timeline')){
      node.querySelectorAll(':scope > .day').forEach(function(d){
        var numText = d.querySelector('.daynum');
        var dateText = d.querySelector('.date');
        var titleText = d.querySelector('.card-title');
        days.push({
          el: d,
          section: currentSection,
          num: numText ? numText.textContent.trim() : '',
          date: dateText ? dateText.textContent.trim() : '',
          title: titleText ? titleText.textContent.trim() : ''
        });
      });
    }
  });
  if(!days.length) return;

  var groups = {}, order = [];
  days.forEach(function(d, i){
    if(!groups[d.section]){ groups[d.section] = []; order.push(d.section); }
    groups[d.section].push(i);
  });
  order.forEach(function(sec){
    var og = document.createElement('optgroup');
    og.label = sec;
    groups[sec].forEach(function(i){
      var d = days[i];
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = d.num + ' · ' + d.date + ' — ' + d.title;
      og.appendChild(opt);
    });
    jumpSel.appendChild(og);
  });

  var current = 0;
  function showDay(i){
    if(i < 0 || i >= days.length) return;
    days[current].el.classList.remove('active-day');
    current = i;
    var d = days[current];
    d.el.classList.add('active-day');
    document.body.classList.toggle('day1-active', current === 0);
    numEl.textContent = d.num;
    dateEl.textContent = d.date;
    jumpSel.value = current;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === days.length - 1;
    window.scrollTo(0, 0);
    var mapDiv = d.el.querySelector('.daymap');
    if(mapDiv && mapDiv.id && window.MAPS && window.MAPS[mapDiv.id]){
      setTimeout(function(){ window.MAPS[mapDiv.id].invalidateSize(); }, 60);
    }
  }

  prevBtn.addEventListener('click', function(){ showDay(current - 1); });
  nextBtn.addEventListener('click', function(){ showDay(current + 1); });
  jumpSel.addEventListener('change', function(){ showDay(parseInt(jumpSel.value, 10)); });

  document.body.classList.add('paginated');
  showDay(current);
};
