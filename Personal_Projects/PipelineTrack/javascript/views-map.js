/* ══════════════════════════════════════════════════════════
   MAP LAYOUT  —  Leaflet + OpenStreetMap + Nominatim
   ══════════════════════════════════════════════════════════ */

const MAP_STAGE_COLORS = {
  saved: '#6b7280',
  applied: '#00d4aa',
  screening: '#a78bfa',
  interview: '#eab308',
  offer: '#22c55e',
  declined: '#ef4444',
  ghosted: '#f97316',
  archived: '#9ca3af',
  withdrew: '#9ca3af',
};

let _mapInstance = null;
let _geocodeQueue = [];
let _geocoding = false;

/* ── Split a location string into individual locations ── */
function splitLocations(location) {
  if (!location) return [];
  // Always split on ;
  // Only split on , if there are 3+ comma-separated segments
  // (e.g. "Austin, TX" → 2 parts → keep as one; "Austin, TX, Seattle, WA" → 4 parts → split pairs)
  let parts = location.split(';').map(s => s.trim()).filter(Boolean);
  const result = [];
  for (const part of parts) {
    const byComma = part.split(',').map(s => s.trim()).filter(Boolean);
    if (byComma.length >= 4) {
      // Pair them up: ["Austin", "TX", "Seattle", "WA"] → ["Austin, TX", "Seattle, WA"]
      for (let i = 0; i < byComma.length - 1; i += 2) {
        result.push(`${byComma[i]}, ${byComma[i + 1]}`);
      }
      // If odd count, push last segment alone
      if (byComma.length % 2 !== 0) result.push(byComma[byComma.length - 1]);
    } else {
      result.push(part);
    }
  }
  return result.filter(p => !p.toLowerCase().includes('remote'));
}

/* ── Geocode a single location string via Nominatim ───── */
async function geocodeLocation(location) {
  if (!location || location.toLowerCase().includes('remote')) return null;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'PipelineTrack/1.0'
      }
    });
    const data = await res.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (_) {}
  return null;
}

/* Rate-limited geocode runner — 1 req/sec (Nominatim limit)
   Stores coords as an array so multi-location jobs get multiple pins. */
async function runGeocodeQueue(jobs, onProgress) {
  if (_geocoding) return;
  _geocoding = true;

  // Only queue jobs whose coords haven't been resolved yet
  const needsGeocode = jobs.filter(j => j.location && j.coords === undefined);

  let done = 0;
  for (const job of needsGeocode) {
    const locs = splitLocations(job.location);
    const results = [];
    for (let i = 0; i < locs.length; i++) {
      const coords = await geocodeLocation(locs[i]);
      if (coords) results.push({
        label: locs[i],
        ...coords
      });
      if (i < locs.length - 1) await new Promise(r => setTimeout(r, 1100));
    }
    job.coords = results.length ? results : [];
    save();
    done++;
    onProgress(done, needsGeocode.length, job);
    if (done < needsGeocode.length) {
      await new Promise(r => setTimeout(r, 1100));
    }
  }

  _geocoding = false;
}

/* ── Create a circle marker for one coord entry ────────── */
function makePin(job, coordEntry) {
  const color = MAP_STAGE_COLORS[job.stage] || '#6b7280';
  return L.circleMarker([coordEntry.lat, coordEntry.lng], {
    radius: 9,
    fillColor: color,
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.9,
  });
}

/* ── Legend HTML ──────────────────────────────────────── */
function mapLegendHTML(jobs) {
  const usedStages = [...new Set(jobs.filter(j => Array.isArray(j.coords) && j.coords.length > 0).map(j => j.stage))];
  const hasRemote = jobs.some(j => j.location && j.location.toLowerCase().includes('remote'));
  const hasNoLocation = jobs.some(j => !j.location);

  const dots = usedStages.map(s => `
    <div class="map-legend-item">
      <div class="map-legend-dot" style="background:${MAP_STAGE_COLORS[s] || '#6b7280'}"></div>
      ${STAGE_LABELS[s] || s}
    </div>`).join('');

  const note = (hasRemote || hasNoLocation) ?
    `<div class="map-remote-note">Remote and unlocated opportunities are available in the job list.</div>` :
    '';

  return `<div class="map-legend">${dots}${note}</div>`;
}

/* ── Main render ──────────────────────────────────────── */
function mapIsRemote(job) {
  return String(job.workType || '').toLowerCase() === 'remote' || /remote/i.test(job.location || '');
}

function renderBoardMap(jobs) {
  const remote = jobs.filter(mapIsRemote);
  const local = jobs.filter(j => !mapIsRemote(j));
  const card = job => `<article class="map-job" data-map-job="${escHtml(job.id)}">
    <div class="map-job-meta"><span class="map-legend-dot" style="background:${MAP_STAGE_COLORS[job.stage] || '#6b7280'}"></span>${escHtml(STAGE_LABELS[job.stage] || job.stage)}<span class="fit-badge ${fitBadgeClass(job.fitScore)}">${fitBadgeLabel(job.fitScore)}</span></div>
    <button class="map-job-focus" data-map-focus="${escHtml(job.id)}">${escHtml(job.role || 'Untitled role')}</button>
    <p>${escHtml(job.company || 'Company not specified')}</p>
    <div class="map-job-location">${escHtml(job.location || 'Location not specified')}</div>
    <div class="map-job-actions"><span data-map-state="${escHtml(job.id)}">${mapIsRemote(job) ? 'Remote opportunity' : !job.location ? 'No location provided' : Array.isArray(job.coords) ? job.coords.length ? 'Select to explore location' : 'Location unavailable' : 'Locating opportunity…'}</span><button class="btn-ghost" data-map-open="${escHtml(job.id)}">Open job ↗</button></div>
  </article>`;
  return `<div class="map-explorer-heading"><div><span class="workspace-eyebrow">LOCATION EXPLORER</span><h2>Find where your next move could take you.</h2><p>Select an opportunity to explore its location. Your board filters apply here too.</p></div><span class="map-total">${jobs.length} opportunities</span></div>
    <div class="map-explorer">
      <aside class="map-job-list" aria-label="Opportunities by location">
        ${local.length ? `<h3>By location <span>${local.length}</span></h3>${local.map(card).join('')}` : ''}
        ${remote.length ? `<h3>Remote opportunities <span>${remote.length}</span></h3>${remote.map(card).join('')}` : ''}
        ${!jobs.length ? '<div class="map-list-empty">No opportunities match your filters.</div>' : ''}
      </aside>
      <div class="map-canvas-panel"><div class="map-canvas-toolbar"><span>Explore your opportunities</span><button class="btn-secondary" id="map-fit-all">Fit all locations</button></div>
        <div class="map-wrap"><div id="pt-map"></div><div class="map-status" id="map-status" role="status" style="display:none"></div></div>
        ${mapLegendHTML(jobs)}
      </div>
    </div>`;
}

function wireMap(jobs) {
  if (_mapInstance) {
    _mapInstance.remove();
    _mapInstance = null;
  }
  const container = document.getElementById('pt-map');
  if (!container) return;
  const root = container.closest('.map-explorer');
  root.querySelectorAll('[data-map-open]').forEach(button => {
    button.addEventListener('click', () => openJobDetail(button.dataset.mapOpen));
  });
  if (typeof L === 'undefined') {
    container.innerHTML = '<div class="map-empty">The map could not load. You can still explore your jobs in the list.</div>';
    root.querySelectorAll('[data-map-focus]').forEach(button => button.addEventListener('click', () => openJobDetail(button.dataset.mapFocus)));
    root.querySelector('#map-fit-all').disabled = true;
    return;
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const map = L.map(container, {
    zoomControl: true,
    zoomAnimation: !reducedMotion,
    fadeAnimation: !reducedMotion
  });
  _mapInstance = map;
  const markers = new Map();
  const allMarkers = [];
  let selected = null;
  let userExploring = false;
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);
  map.setView([39.5, -98.35], 4);
  map.on('dragstart', () => {
    userExploring = true;
  });
  container.addEventListener('wheel', () => {
    userExploring = true;
  }, {
    passive: true
  });
  const fitAll = () => {
    if (allMarkers.length) map.fitBounds(L.featureGroup(allMarkers).getBounds().pad(.2), {
      maxZoom: 11,
      animate: !reducedMotion
    });
  };
  root.querySelector('#map-fit-all').addEventListener('click', fitAll);
  root.querySelector('.leaflet-control-zoom') ?.addEventListener('click', () => {
    userExploring = true;
  });
  const selectJob = (id, focusMap) => {
    selected = id;
    root.querySelectorAll('[data-map-job]').forEach(card => {
      const active = card.dataset.mapJob === id;
      card.classList.toggle('is-selected', active);
      card.querySelector('[data-map-focus]').setAttribute('aria-pressed', String(active));
      if (active && !focusMap) card.scrollIntoView({
        block: 'nearest',
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    });
    markers.forEach((pins, jobId) => pins.forEach(pin => pin.setStyle({
      radius: jobId === id ? 12 : 9,
      weight: jobId === id ? 3 : 2
    })));
    const pins = markers.get(id);
    if (focusMap && pins && pins.length) {
      userExploring = true;
      map.fitBounds(L.featureGroup(pins).getBounds().pad(.3), {
        maxZoom: 11,
        animate: !reducedMotion
      });
      pins[0].openPopup();
    }
  };
  root.querySelectorAll('[data-map-focus]').forEach(button => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => selectJob(button.dataset.mapFocus, true));
  });
  const addJobPins = job => {
    if (markers.has(job.id)) return;
    const pins = [];
    (Array.isArray(job.coords) ? job.coords : []).forEach(coord => {
      if (!Number.isFinite(coord.lat) || !Number.isFinite(coord.lng)) return;
      const pin = makePin(job, coord).addTo(map);
      const popup = document.createElement('div');
      popup.className = 'map-popup';
      popup.innerHTML = `<div class="map-popup-role">${escHtml(job.role || 'Untitled role')}</div><div class="map-popup-company">${escHtml(job.company || '')}<br>${escHtml(coord.label || job.location || '')}</div><div class="map-popup-details">${escHtml(STAGE_LABELS[job.stage] || job.stage)} · ${fitBadgeLabel(job.fitScore)}</div><button class="btn-secondary">Open job ↗</button>`;
      popup.querySelector('button').addEventListener('click', () => openJobDetail(job.id));
      pin.bindPopup(popup, {
        maxWidth: 280
      });
      pin.on('click', () => selectJob(job.id, false));
      pins.push(pin);
      allMarkers.push(pin);
    });
    markers.set(job.id, pins);
    root.querySelectorAll('[data-map-state]').forEach(label => {
      if (label.dataset.mapState === job.id) label.textContent = pins.length ? 'Select to explore location' : 'Location unavailable';
    });
    if (selected === job.id) selectJob(job.id, false);
  };
  const mappable = jobs.filter(j => !mapIsRemote(j) && splitLocations(j.location).length);
  mappable.forEach(job => {
    if (job.coords && !Array.isArray(job.coords)) job.coords = undefined;
    if (Array.isArray(job.coords)) addJobPins(job);
  });
  fitAll();
  const status = root.querySelector('#map-status');
  const pending = mappable.filter(j => j.coords === undefined);
  if (!allMarkers.length && !pending.length) {
    status.style.display = '';
    status.textContent = 'No mapped locations. Remote and unlocated jobs are available in the list.';
  }
  if (pending.length) {
    status.style.display = '';
    status.textContent = 'Locating opportunities…';
    // A previous render may still own the rate-limited queue. Retry only
    // while this map is current, then reuse its cached coordinates.
    const locate = () => {
      if (_mapInstance !== map || !container.isConnected) return;
      mappable.filter(j => Array.isArray(j.coords)).forEach(addJobPins);
      if (_geocoding) {
        setTimeout(locate, 1200);
        return;
      }
      if (!mappable.some(j => j.coords === undefined)) {
        status.style.display = allMarkers.length ? 'none' : '';
        status.textContent = 'Locations could not be mapped. Your jobs remain available in the list.';
        if (!userExploring) fitAll();
        return;
      }
      runGeocodeQueue(mappable, (done, total, job) => {
        if (_mapInstance !== map || !container.isConnected) return;
        addJobPins(job);
        status.textContent = `Locating opportunities… ${done}/${total}`;
        if (!userExploring) fitAll();
        if (done === total) {
          status.style.display = allMarkers.length ? 'none' : '';
          status.textContent = 'Locations could not be mapped. Your jobs remain available in the list.';
        }
      });
    };
    locate();
  }
  requestAnimationFrame(() => {
    if (_mapInstance === map) map.invalidateSize();
  });
}