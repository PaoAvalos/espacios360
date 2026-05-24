// ─── Leaflet map for properties ────────────────────────────────────
// Map centered on Monterrey metro area

let mapInstance = null;
let markersLayer = null;

const STATUS_COLORS = {
  disponible: '#22C55E',
  en_proceso: '#F59E0B',
  vendida:    '#94A3B8'
};

function initMap(containerId, options = {}) {
  if (mapInstance) { mapInstance.remove(); mapInstance = null; }

  mapInstance = L.map(containerId, {
    center: options.center || [25.6866, -100.3161],
    zoom:   options.zoom   || 11,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);
  return mapInstance;
}

function createMarkerIcon(status) {
  const color = STATUS_COLORS[status] || '#3AACDC';
  return L.divIcon({
    className: '',
    html: `<div class="map-marker" style="background:${color}">
             <i class="fa-solid fa-location-dot"></i>
           </div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 36],
    popupAnchor:[0, -36]
  });
}

function addPropertyMarkers(properties, onMarkerClick) {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  properties.forEach(p => {
    if (!p.lat || !p.lng) return;
    const marker = L.marker([p.lat, p.lng], { icon: createMarkerIcon(p.status) });

    const img = (p.images && p.images[0]) || 'img/placeholder.jpg';
    marker.bindPopup(`
      <div class="map-popup">
        <a href="propiedad.html?id=${p.id}">
          <img src="${img}" alt="${p.title}" onerror="this.src='img/placeholder.jpg'">
          <div class="popup-body">
            <span class="popup-status status-${p.status}">${statusLabel(p.status)}</span>
            <strong>${p.title}</strong>
            <span class="popup-price">${formatPrice(p.price, p.operation)}</span>
            ${p.area_m2 ? `<span class="popup-detail">${p.area_m2} m²</span>` : ''}
          </div>
        </a>
      </div>`, { maxWidth: 220 });

    if (onMarkerClick) marker.on('click', () => onMarkerClick(p));
    markersLayer.addLayer(marker);
  });
}

function flyToProperty(lat, lng) {
  if (mapInstance) mapInstance.flyTo([lat, lng], 15, { duration: 1 });
}

// Picker mode: click on map to select coordinates (used in admin)
function enableCoordinatePicker(callback) {
  if (!mapInstance) return;
  mapInstance.getContainer().style.cursor = 'crosshair';
  mapInstance.once('click', (e) => {
    mapInstance.getContainer().style.cursor = '';
    callback(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    L.marker([e.latlng.lat, e.latlng.lng], { icon: createMarkerIcon('disponible') })
      .addTo(mapInstance).bindPopup('Ubicación seleccionada').openPopup();
  });
}
