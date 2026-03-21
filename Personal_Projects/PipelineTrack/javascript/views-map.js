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
    `<div class="map-remote-note">Remote / no-location jobs are not shown on the map</div>` :
    '';

  return `<div class="map-legend">${dots}${note}</div>`;
}

/* ── Main render ──────────────────────────────────────── */
function renderBoardMap(jobs) {
  const mappable = jobs.filter(j => splitLocations(j.location).length > 0);
  const pinnable = mappable.filter(j => Array.isArray(j.coords) && j.coords.length > 0);

  if (mappable.length === 0) {
    return `
      <div class="map-wrap">
        <div class="map-empty">
          <div class="map-empty-icon">🗺️</div>
          <div>No jobs with a location to map yet</div>
        </div>
      </div>`;
  }

  return `
    <div class="map-wrap">
      <div id="pt-map"></div>
      <div class="map-status" id="map-status" style="display:none"></div>
    </div>
    ${mapLegendHTML(jobs)}`;
}

/* ── Wire the Leaflet map after innerHTML is set ─────── */
function wireMap(jobs) {
  const container = document.getElementById('pt-map');
  if (!container) return;

  if (_mapInstance) {
    _mapInstance.remove();
    _mapInstance = null;
  }

  const mappable = jobs.filter(j => splitLocations(j.location).length > 0);
  const pinnable = mappable.filter(j => Array.isArray(j.coords) && j.coords.length > 0);

  _mapInstance = L.map('pt-map', {
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(_mapInstance);

  if (pinnable.length === 0) {
    _mapInstance.setView([39.5, -98.35], 4);
  } else {
    const markers = [];
    pinnable.forEach(job => {
      const color = MAP_STAGE_COLORS[job.stage] || '#6b7280';
      job.coords.forEach(coordEntry => {
        const marker = makePin(job, coordEntry);
        marker.addTo(_mapInstance);

        marker.bindPopup(`
          <div class="map-popup" data-job-id="${job.id}">
            <div class="map-popup-role">${job.role || 'Untitled'}</div>
            <div class="map-popup-company">${job.company || ''} · ${coordEntry.label || job.location || ''}</div>
            <span class="map-popup-stage" style="background:${color}">${STAGE_LABELS[job.stage] || job.stage}</span>
            <div class="map-popup-hint">Click to open</div>
          </div>`, {
          maxWidth: 240
        });

        marker.on('popupopen', () => {
          setTimeout(() => {
            const el = document.querySelector(`.map-popup[data-job-id="${job.id}"]`);
            if (el) el.addEventListener('click', () => {
              _mapInstance.closePopup();
              openJobDetail(job.id);
            });
          }, 50);
        });

        markers.push(marker);
      });
    });

    // Fit map to all pins
    const group = L.featureGroup(markers);
    _mapInstance.fitBounds(group.getBounds().pad(0.2));
  }

  // Geocode any jobs that don't have coords yet
  // Migrate old single-object coords to array format
  mappable.forEach(j => {
    if (j.coords && !Array.isArray(j.coords)) j.coords = undefined;
  });

  const needsGeocode = mappable.filter(j => j.coords === undefined);
  if (needsGeocode.length > 0) {
    const statusEl = document.getElementById('map-status');
    if (statusEl) statusEl.style.display = '';

    runGeocodeQueue(mappable, (done, total, job) => {
      if (statusEl) statusEl.textContent = `Locating jobs… ${done}/${total}`;
      // Drop pins for this job as soon as it's geocoded
      if (job && Array.isArray(job.coords)) {
        const color = MAP_STAGE_COLORS[job.stage] || '#6b7280';
        job.coords.forEach(coordEntry => {
          const m = makePin(job, coordEntry);
          m.addTo(_mapInstance);
          m.bindPopup(`
            <div class="map-popup" data-job-id="${job.id}">
              <div class="map-popup-role">${job.role || 'Untitled'}</div>
              <div class="map-popup-company">${job.company || ''} · ${coordEntry.label || job.location || ''}</div>
              <span class="map-popup-stage" style="background:${color}">${STAGE_LABELS[job.stage] || job.stage}</span>
              <div class="map-popup-hint">Click to open</div>
            </div>`, {
            maxWidth: 240
          });
          m.on('popupopen', () => {
            setTimeout(() => {
              const el = document.querySelector(`.map-popup[data-job-id="${job.id}"]`);
              if (el) el.addEventListener('click', () => {
                _mapInstance.closePopup();
                openJobDetail(job.id);
              });
            }, 50);
          });
        });
      }
      if (done === total) {
        if (statusEl) statusEl.style.display = 'none';
      }
    });
  }
}