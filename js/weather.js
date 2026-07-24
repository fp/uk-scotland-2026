(function(){
  var CATEGORY_LABELS = {
    'smart-indoor': '🎩 Smart',
    'city-casual': '🧥 Casual',
    'highland-layers': '🧶 Highland',
    'full-waterproof': '☔ Waterproof',
    'active-outdoor': '🥾 Active',
    'travel-comfort': '✈️ Travel'
  };

  var CATEGORY_DEFS = {
    'smart-indoor': 'Smart Layers (Indoor/Formal) — palace and castle interiors, galleries, formal teas. Smart-casual outfit, a light jacket or cardigan for getting there, and a compact umbrella just in case.',
    'city-casual': 'City Casual + Umbrella — everyday sightseeing on mild, mostly-dry days. Comfortable walking clothes, a light layer, and a packable rain shell.',
    'highland-layers': 'Highland Layers — scenic Highlands/Speyside stops on cool or showery days. Base layer + fleece or jumper, waterproof jacket, comfortable walking shoes.',
    'full-waterproof': 'Full Waterproofs — cold, wet and/or windy days anywhere on the trip. Waterproof jacket and trousers, warm hat, gloves, waterproof boots.',
    'active-outdoor': 'Active Outdoor Gear — hiking, the Highland Games, and fly fishing. Technical hiking layers, sturdy waterproof boots, a weatherproof shell.',
    'travel-comfort': 'Travel Comfort — flight and transfer days. Easy layers you can add or shed for the airport, the cabin, and changing temperatures.'
  };

  var WMO = {
    0:['Clear','☀️'],1:['Mostly clear','🌤️'],2:['Partly cloudy','⛅'],3:['Overcast','☁️'],
    45:['Fog','🌫️'],48:['Fog','🌫️'],
    51:['Light drizzle','🌦️'],53:['Drizzle','🌦️'],55:['Heavy drizzle','🌦️'],
    56:['Freezing drizzle','🌧️'],57:['Freezing drizzle','🌧️'],
    61:['Light rain','🌧️'],63:['Rain','🌧️'],65:['Heavy rain','🌧️'],
    66:['Freezing rain','🌧️'],67:['Freezing rain','🌧️'],
    71:['Light snow','🌨️'],73:['Snow','🌨️'],75:['Heavy snow','🌨️'],77:['Snow grains','🌨️'],
    80:['Rain showers','🌦️'],81:['Rain showers','🌦️'],82:['Heavy showers','🌦️'],
    85:['Snow showers','🌨️'],86:['Snow showers','🌨️'],
    95:['Thunderstorm','⛈️'],96:['Thunderstorm','⛈️'],99:['Thunderstorm','⛈️']
  };

  var DAYS = [
    {day:1, date:'2026-07-25', loc:'London', region:'south', activity:'indoor-formal', lat:51.5135, lon:-0.1199},
    {day:2, date:'2026-07-26', loc:'London', region:'south', activity:'indoor-formal', lat:51.5135, lon:-0.1199},
    {day:3, date:'2026-07-27', loc:'Windsor', region:'south', activity:'indoor-formal', lat:51.4839, lon:-0.6044,
      to:{loc:'Leeds', lat:53.7997, lon:-1.5492}},
    {day:4, date:'2026-07-28', loc:'York', region:'south', activity:'city-walking', lat:53.9600, lon:-1.0873},
    {day:5, date:'2026-07-29', loc:'Harrogate', region:'south', activity:'outdoor-scenic', lat:53.9919, lon:-1.5378},
    {day:6, date:'2026-07-30', loc:'Saltaire / Leeds', region:'south', activity:'city-walking', lat:53.7997, lon:-1.5492},
    {day:7, date:'2026-07-31', loc:'Leeds', region:'south', activity:'city-walking', lat:53.7997, lon:-1.5492},
    {day:8, date:'2026-08-01', loc:'Fort Augustus', region:'north', activity:'outdoor-scenic', lat:57.1448, lon:-4.6805},
    {day:9, date:'2026-08-02', loc:'Glencoe', region:'north', activity:'outdoor-scenic', lat:56.6615, lon:-4.9174},
    {day:10, date:'2026-08-03', loc:'Loch Ness / Culloden', region:'north', activity:'outdoor-scenic', lat:57.3241, lon:-4.4420},
    {day:11, date:'2026-08-04', loc:'Fort William / Ben Nevis', region:'north', activity:'outdoor-active', lat:56.7968, lon:-5.0035},
    {day:12, date:'2026-08-05', loc:'Portree, Skye', region:'north', activity:'outdoor-active', lat:57.4124, lon:-6.1953,
      note:"Dinner after: The Three Chimneys (Michelin-recognised), Colbost — about 3 hr from the hotel, too far to swing back and change first. Games gear all day; if you want a small step up for dinner, pack one easy smart-casual layer to swap into en route rather than a full outfit."},
    {day:13, date:'2026-08-06', loc:'Glengarry', region:'north', activity:'indoor-formal', lat:57.0691, lon:-4.7782,
      to:{loc:'Craigellachie', lat:57.4892, lon:-3.1901}},
    {day:14, date:'2026-08-07', loc:'Craigellachie / Aberlour', region:'north', activity:'outdoor-active', lat:57.4892, lon:-3.1901,
      secondary:'smart-indoor', secondaryNote:"GEAMAIR tasting menu, in-house at the hotel that evening — easy to change before dinner. Pack a smart-casual outfit alongside the day's outdoor gear."},
    {day:15, date:'2026-08-08', loc:'Aviemore / Cairngorms', region:'north', activity:'outdoor-scenic', lat:57.2005, lon:-3.8281},
    {day:16, date:'2026-08-09', loc:'Craigellachie', region:'north', activity:'indoor-formal', lat:57.4892, lon:-3.1901,
      to:{loc:'Aberdeen', lat:57.2037, lon:-2.2002}},
    {day:17, date:'2026-08-10', loc:'Aberdeen', region:'north', activity:'travel', lat:57.2037, lon:-2.2002,
      to:{loc:'Houston', lat:29.7604, lon:-95.3698}}
  ];

  function pad2(n){ return String(n).padStart(2,'0'); }

  function fmtDate(iso){
    var d = new Date(iso + 'T12:00:00Z');
    return d.toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short', timeZone:'UTC'}).replace(',', '');
  }

  function round(n){ return (n===null||n===undefined||isNaN(n)) ? null : Math.round(n); }

  function toF(c){ return (c===null||c===undefined||isNaN(c)) ? null : Math.round(c*9/5+32); }

  function escapeAttr(s){
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  async function fetchJSON(url){
    var res = await fetch(url);
    if(!res.ok) throw new Error('Weather fetch failed: ' + res.status);
    return res.json();
  }

  function pickCategory(d, wx){
    if(d.activity === 'travel') return 'travel-comfort';
    if(d.activity === 'indoor-formal') return 'smart-indoor';
    if(d.activity === 'outdoor-active') return 'active-outdoor';

    var tMax = wx.tMax;
    var cold = tMax !== null && tMax < 10;
    var cool = tMax !== null && tMax >= 10 && tMax < 15;
    var wet = (wx.precipProb !== null && wx.precipProb >= 50) || (wx.precipProb === null && wx.precipSum !== null && wx.precipSum >= 5);
    var showers = !wet && ((wx.precipProb !== null && wx.precipProb >= 25) || (wx.precipProb === null && wx.precipSum !== null && wx.precipSum >= 1));
    var windy = wx.windMax !== null && wx.windMax >= 30;

    if(cold || wet || windy) return 'full-waterproof';
    if(cool || showers) return d.region === 'north' ? 'highland-layers' : 'city-casual';
    return 'city-casual';
  }

  function wxSummary(wx){
    if(!wx || wx.tMax === null) return { text: 'Unavailable' };
    var wmo = WMO[wx.code] || ['',''];
    var precipTxt = wx.precipProb !== null && wx.precipProb !== undefined ? (wx.precipProb + '% rain') : (wx.precipSum !== null && wx.precipSum !== undefined ? wx.precipSum.toFixed(1) + 'mm' : '');
    var tMinC = round(wx.tMin), tMaxC = round(wx.tMax);
    var tMinF = toF(tMinC), tMaxF = toF(tMaxC);
    var tempTxt = tMinC + '–' + tMaxC + '°C (' + tMinF + '–' + tMaxF + '°F)';
    var parts = [tempTxt];
    if(precipTxt) parts.push(precipTxt);
    return { text: (wmo[1] ? wmo[1] + ' ' : '') + parts.join(' · ') };
  }

  function sourceLabelFor(wx){
    return wx.source === 'forecast' ? 'Live forecast' : (wx.source === 'typical' ? 'Typical (3-yr avg)' : 'Not available yet');
  }

  function locLine(label, wx){
    return '<div class="day-wx-row"><span class="wx-loc-label">' + label + '</span><span class="day-wx-text">' + wxSummary(wx).text + '</span></div>';
  }

  function forecastBlockHTML(d, wxFor){
    var wx1 = wxFor(d.lat, d.lon, d.date);
    if(d.to){
      var wx2 = wxFor(d.to.lat, d.to.lon, d.date);
      return '<div class="day-wx-multi">' +
        locLine(d.loc, wx1) +
        locLine(d.to.loc, wx2) +
        '<span class="wx-source">' + sourceLabelFor(wx1) + '</span>' +
        '</div>';
    }
    return '<span class="day-wx-text">' + wxSummary(wx1).text + '<span class="wx-source">' + sourceLabelFor(wx1) + '</span></span>';
  }

  function todayISO(){
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
  }

  function daysBetween(a, b){
    var da = new Date(a + 'T00:00:00Z'), db = new Date(b + 'T00:00:00Z');
    return Math.round((db - da) / 86400000);
  }

  function shiftYear(iso, year){
    var parts = iso.split('-');
    return year + '-' + parts[1] + '-' + parts[2];
  }

  async function getForecastRange(lat, lon, dates){
    var start = dates[0], end = dates[dates.length-1];
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,weathercode' +
      '&timezone=Europe%2FLondon&start_date=' + start + '&end_date=' + end;
    var json = await fetchJSON(url);
    var out = {};
    (json.daily.time || []).forEach(function(t, i){
      out[t] = {
        tMax: round(json.daily.temperature_2m_max[i]),
        tMin: round(json.daily.temperature_2m_min[i]),
        precipSum: json.daily.precipitation_sum ? json.daily.precipitation_sum[i] : null,
        precipProb: json.daily.precipitation_probability_max ? json.daily.precipitation_probability_max[i] : null,
        windMax: json.daily.windspeed_10m_max ? round(json.daily.windspeed_10m_max[i]) : null,
        code: json.daily.weathercode ? json.daily.weathercode[i] : null,
        source: 'forecast'
      };
    });
    return out;
  }

  async function getClimatology(lat, lon, dates){
    var years = [2023, 2024, 2025];
    var start = dates[0], end = dates[dates.length-1];
    var perYear = await Promise.allSettled(years.map(function(y){
      var s = shiftYear(start, y), e = shiftYear(end, y);
      var url = 'https://archive-api.open-meteo.com/v1/archive?latitude=' + lat + '&longitude=' + lon +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode' +
        '&timezone=Europe%2FLondon&start_date=' + s + '&end_date=' + e;
      return fetchJSON(url);
    }));

    var out = {};
    dates.forEach(function(d){
      var samples = [];
      perYear.forEach(function(res, idx){
        if(res.status !== 'fulfilled') return;
        var json = res.value;
        var sd = shiftYear(d, years[idx]);
        var i = (json.daily.time || []).indexOf(sd);
        if(i === -1) return;
        samples.push({
          tMax: json.daily.temperature_2m_max[i],
          tMin: json.daily.temperature_2m_min[i],
          precipSum: json.daily.precipitation_sum ? json.daily.precipitation_sum[i] : null,
          windMax: json.daily.windspeed_10m_max ? json.daily.windspeed_10m_max[i] : null,
          code: json.daily.weathercode ? json.daily.weathercode[i] : null
        });
      });
      if(!samples.length){ out[d] = null; return; }
      var avg = function(key){
        var vals = samples.map(function(s){ return s[key]; }).filter(function(v){ return v !== null && v !== undefined; });
        if(!vals.length) return null;
        return vals.reduce(function(a,b){ return a+b; }, 0) / vals.length;
      };
      out[d] = {
        tMax: round(avg('tMax')),
        tMin: round(avg('tMin')),
        precipSum: avg('precipSum'),
        precipProb: null,
        windMax: round(avg('windMax')),
        code: samples[0].code,
        source: 'typical'
      };
    });
    return out;
  }

  function renderTable(wxFor){
    var tbody = document.getElementById('weatherTbody');
    var status = document.getElementById('weatherStatus');
    if(!tbody) return;

    var rows = DAYS.map(function(d){
      var wx1 = wxFor(d.lat, d.lon, d.date);
      var cat = pickCategory(d, wx1);
      var locText = d.loc + (d.to ? ' → ' + d.to.loc : '');
      var badges = '<span class="wx-badge ' + cat + '" title="' + escapeAttr(CATEGORY_DEFS[cat]) + '">' + CATEGORY_LABELS[cat] + '</span>';
      if(d.secondary){
        badges += '<span class="wx-badge ' + d.secondary + '" title="' + escapeAttr(d.secondaryNote || CATEGORY_DEFS[d.secondary]) + '">' + CATEGORY_LABELS[d.secondary] + '</span>';
      }
      var noteHTML = d.note ? '<div class="wx-day-note">' + escapeAttr(d.note) + '</div>' : '';
      return '<tr>' +
        '<td class="wx-daycell"><span class="wx-daynum">Day ' + pad2(d.day) + '</span><span class="wx-date">' + fmtDate(d.date) + '</span></td>' +
        '<td class="wx-loc">' + locText + '</td>' +
        '<td class="wx-forecast">' + forecastBlockHTML(d, wxFor) + '</td>' +
        '<td>' + badges + noteHTML + '</td>' +
        '</tr>';
    });

    tbody.innerHTML = rows.join('');
    if(status) status.textContent = 'Updated ' + new Date().toLocaleString('en-GB', {dateStyle:'medium', timeStyle:'short'});
  }

  function renderInlineDayWeather(wxFor){
    DAYS.forEach(function(d){
      var el = document.querySelector('.day-weather[data-wx-day="' + d.day + '"]');
      if(!el) return;
      var wx1 = wxFor(d.lat, d.lon, d.date);
      var cat = pickCategory(d, wx1);
      var html = '<span class="wx-badge ' + cat + '" title="' + escapeAttr(CATEGORY_DEFS[cat]) + '">' + CATEGORY_LABELS[cat] + '</span>';
      if(d.secondary){
        html += '<span class="wx-badge ' + d.secondary + '" title="' + escapeAttr(d.secondaryNote || CATEGORY_DEFS[d.secondary]) + '">' + CATEGORY_LABELS[d.secondary] + '</span>';
      }
      html += forecastBlockHTML(d, wxFor);
      if(d.note){ html += '<div class="wx-day-note">' + escapeAttr(d.note) + '</div>'; }
      el.innerHTML = html;
    });
  }

  window.initWeather = async function(){
    var today = todayISO();
    var byLoc = {};
    function addPoint(lat, lon, date){
      var key = lat + ',' + lon;
      if(!byLoc[key]) byLoc[key] = { lat: lat, lon: lon, forecastDates: [], climoDates: [] };
      var diff = daysBetween(today, date);
      var bucket = (diff >= 0 && diff <= 15) ? byLoc[key].forecastDates : byLoc[key].climoDates;
      if(bucket.indexOf(date) === -1) bucket.push(date);
    }
    DAYS.forEach(function(d){
      addPoint(d.lat, d.lon, d.date);
      if(d.to) addPoint(d.to.lat, d.to.lon, d.date);
    });

    var wxByDate = {};
    var keys = Object.keys(byLoc);
    await Promise.all(keys.map(async function(key){
      var loc = byLoc[key];
      try {
        if(loc.forecastDates.length){
          var f = await getForecastRange(loc.lat, loc.lon, loc.forecastDates.sort());
          Object.keys(f).forEach(function(date){ wxByDate[key + '|' + date] = f[date]; });
        }
      } catch(e){ console.error('Forecast fetch failed for', key, e); }
      try {
        if(loc.climoDates.length){
          var c = await getClimatology(loc.lat, loc.lon, loc.climoDates.sort());
          Object.keys(c).forEach(function(date){ if(c[date]) wxByDate[key + '|' + date] = c[date]; });
        }
      } catch(e){ console.error('Climatology fetch failed for', key, e); }
    }));

    function wxFor(lat, lon, date){
      return wxByDate[lat + ',' + lon + '|' + date] || { tMax:null, tMin:null, precipProb:null, precipSum:null, windMax:null, code:null, source:null };
    }

    renderTable(wxFor);
    renderInlineDayWeather(wxFor);
  };
})();
