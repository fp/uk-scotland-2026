(function(){
  var CATEGORY_LABELS = {
    'smart-indoor': '🎩 Smart Layers',
    'city-casual': '🧥 City Casual',
    'highland-layers': '🧶 Highland Layers',
    'full-waterproof': '☔ Full Waterproofs',
    'active-outdoor': '🥾 Active Outdoor Gear',
    'travel-comfort': '✈️ Travel Comfort'
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
    {day:3, date:'2026-07-27', loc:'Windsor', region:'south', activity:'indoor-formal', lat:51.4839, lon:-0.6044},
    {day:4, date:'2026-07-28', loc:'York', region:'south', activity:'city-walking', lat:53.9600, lon:-1.0873},
    {day:5, date:'2026-07-29', loc:'Harrogate', region:'south', activity:'outdoor-scenic', lat:53.9919, lon:-1.5378},
    {day:6, date:'2026-07-30', loc:'Saltaire / Leeds', region:'south', activity:'city-walking', lat:53.7997, lon:-1.5492},
    {day:7, date:'2026-07-31', loc:'Leeds', region:'south', activity:'city-walking', lat:53.7997, lon:-1.5492},
    {day:8, date:'2026-08-01', loc:'Fort Augustus', region:'north', activity:'outdoor-scenic', lat:57.1448, lon:-4.6805},
    {day:9, date:'2026-08-02', loc:'Glencoe', region:'north', activity:'outdoor-scenic', lat:56.6615, lon:-4.9174},
    {day:10, date:'2026-08-03', loc:'Loch Ness / Culloden', region:'north', activity:'outdoor-scenic', lat:57.3241, lon:-4.4420},
    {day:11, date:'2026-08-04', loc:'Fort William / Ben Nevis', region:'north', activity:'outdoor-active', lat:56.7968, lon:-5.0035},
    {day:12, date:'2026-08-05', loc:'Portree, Skye', region:'north', activity:'outdoor-active', lat:57.4124, lon:-6.1953},
    {day:13, date:'2026-08-06', loc:'Glenfarclas', region:'north', activity:'indoor-formal', lat:57.4230, lon:-3.3176},
    {day:14, date:'2026-08-07', loc:'Craigellachie / Aberlour', region:'north', activity:'outdoor-active', lat:57.4892, lon:-3.1901},
    {day:15, date:'2026-08-08', loc:'Aviemore / Cairngorms', region:'north', activity:'outdoor-scenic', lat:57.2005, lon:-3.8281},
    {day:16, date:'2026-08-09', loc:'Balmoral', region:'north', activity:'indoor-formal', lat:57.0396, lon:-3.2292},
    {day:17, date:'2026-08-10', loc:'Aberdeen', region:'north', activity:'travel', lat:57.2037, lon:-2.2002}
  ];

  function pad2(n){ return String(n).padStart(2,'0'); }

  function fmtDate(iso){
    var d = new Date(iso + 'T12:00:00Z');
    return d.toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short', timeZone:'UTC'});
  }

  function round(n){ return (n===null||n===undefined||isNaN(n)) ? null : Math.round(n); }

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
    if(!wx || wx.tMax === null) return { text: 'Weather unavailable' };
    var wmo = WMO[wx.code] || ['—',''];
    var precipTxt = wx.precipProb !== null && wx.precipProb !== undefined ? (wx.precipProb + '% rain') : (wx.precipSum !== null && wx.precipSum !== undefined ? wx.precipSum.toFixed(1) + 'mm' : '');
    var parts = [wmo[0], round(wx.tMin) + '–' + round(wx.tMax) + '°C'];
    if(precipTxt) parts.push(precipTxt);
    return { text: wmo[1] + ' ' + parts.join(' · ') };
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

  window.initWeather = async function(){
    var tbody = document.getElementById('weatherTbody');
    var status = document.getElementById('weatherStatus');
    if(!tbody) return;

    var today = todayISO();
    var byLoc = {};
    DAYS.forEach(function(d){
      var key = d.lat + ',' + d.lon;
      if(!byLoc[key]) byLoc[key] = { lat: d.lat, lon: d.lon, forecastDates: [], climoDates: [] };
      var diff = daysBetween(today, d.date);
      if(diff >= 0 && diff <= 15) byLoc[key].forecastDates.push(d.date);
      else byLoc[key].climoDates.push(d.date);
    });

    var wxByDate = {};
    var keys = Object.keys(byLoc);
    await Promise.all(keys.map(async function(key){
      var loc = byLoc[key];
      try {
        if(loc.forecastDates.length){
          var f = await getForecastRange(loc.lat, loc.lon, loc.forecastDates.sort());
          Object.assign(wxByDate, f);
        }
      } catch(e){ console.error('Forecast fetch failed for', key, e); }
      try {
        if(loc.climoDates.length){
          var c = await getClimatology(loc.lat, loc.lon, loc.climoDates.sort());
          Object.keys(c).forEach(function(d){ if(c[d]) wxByDate[d] = c[d]; });
        }
      } catch(e){ console.error('Climatology fetch failed for', key, e); }
    }));

    var rows = DAYS.map(function(d){
      var wx = wxByDate[d.date] || { tMax:null, tMin:null, precipProb:null, precipSum:null, windMax:null, code:null, source:null };
      var cat = pickCategory(d, wx);
      var summary = wxSummary(wx);
      var sourceLabel = wx.source === 'forecast' ? 'Live forecast' : (wx.source === 'typical' ? 'Typical (3-yr avg, same date)' : 'Not available yet');
      return '<tr>' +
        '<td class="wx-daynum">Day ' + pad2(d.day) + '</td>' +
        '<td class="wx-date">' + fmtDate(d.date) + '</td>' +
        '<td class="wx-loc">' + d.loc + '</td>' +
        '<td class="wx-forecast">' + summary.text + '<span class="wx-source">' + sourceLabel + '</span></td>' +
        '<td><span class="wx-badge ' + cat + '">' + CATEGORY_LABELS[cat] + '</span></td>' +
        '</tr>';
    });

    tbody.innerHTML = rows.join('');
    if(status) status.textContent = 'Updated ' + new Date().toLocaleString('en-GB', {dateStyle:'medium', timeStyle:'short'});
  };
})();
