// ─── Data layer ────────────────────────────────────────────────────

async function getProperties(filters = {}) {
  if (DEMO_MODE) {
    let data = [...MOCK_PROPERTIES];
    if (filters.featured) data = data.filter(p => p.featured);
    if (filters.status)   data = data.filter(p => p.status === filters.status);
    if (filters.type)     data = data.filter(p => p.type === filters.type);
    if (filters.operation)data = data.filter(p => p.operation === filters.operation);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      data = data.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.neighborhood?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q)
      );
    }
    if (filters.limit) data = data.slice(0, filters.limit);
    return data;
  }
  let query = supabase.from('properties').select('*');
  if (filters.featured)  query = query.eq('featured', true);
  if (filters.status)    query = query.eq('status', filters.status);
  if (filters.type)      query = query.eq('type', filters.type);
  if (filters.operation) query = query.eq('operation', filters.operation);
  if (filters.q)         query = query.ilike('title', `%${filters.q}%`);
  if (filters.limit)     query = query.limit(filters.limit);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

async function getPropertyById(id) {
  if (DEMO_MODE) return MOCK_PROPERTIES.find(p => p.id === id) || null;
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

async function getTotalCount() {
  if (DEMO_MODE) return MOCK_PROPERTIES.length;
  const { count } = await supabase.from('properties').select('*', { count: 'exact', head: true });
  return count || 0;
}

// ─── Property card HTML ─────────────────────────────────────────────

function statusLabel(status) {
  const map = { disponible: 'Disponible', en_proceso: 'En proceso', vendida: 'Vendida' };
  return map[status] || status;
}

function typeLabel(type) {
  const map = {
    casa: 'Casa', departamento: 'Departamento', terreno: 'Terreno',
    local_comercial: 'Local Comercial', oficina: 'Oficina'
  };
  return map[type] || type;
}

function formatPrice(price, operation) {
  if (!price) return 'Consultar';
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 0
  }).format(price);
  return operation === 'renta' ? `${formatted}/mes` : formatted;
}

function propertyCard(p) {
  const img = (p.images && p.images[0]) || 'img/placeholder.jpg';
  const saved = isBookmarked(p.id);
  const details = [];
  if (p.bedrooms)  details.push(`<span><i class="fa-solid fa-bed"></i> ${p.bedrooms}</span>`);
  if (p.bathrooms) details.push(`<span><i class="fa-solid fa-bath"></i> ${p.bathrooms}</span>`);
  if (p.area_m2)   details.push(`<span><i class="fa-solid fa-ruler-combined"></i> ${p.area_m2} m²</span>`);
  if (p.parking)   details.push(`<span><i class="fa-solid fa-car"></i> ${p.parking}</span>`);

  return `
    <div class="prop-card" data-id="${p.id}">
      <a href="propiedad.html?id=${p.id}" class="card-img-wrap">
        <img src="${img}" alt="${p.title}" loading="lazy" onerror="this.src='img/placeholder.jpg'">
        <span class="badge badge-${p.status}">${statusLabel(p.status)}</span>
        <span class="badge-type">${typeLabel(p.type)}</span>
        <button class="btn-bookmark ${saved ? 'saved' : ''}" data-id="${p.id}" aria-label="Guardar propiedad">
          <i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark"></i>
        </button>
      </a>
      <div class="card-body">
        <div class="card-price">${formatPrice(p.price, p.operation)}
          <span class="op-tag op-${p.operation}">${p.operation === 'venta' ? 'Venta' : 'Renta'}</span>
        </div>
        <h3 class="card-title"><a href="propiedad.html?id=${p.id}">${p.title}</a></h3>
        <p class="card-location"><i class="fa-solid fa-location-dot"></i> ${p.neighborhood || p.address || 'Monterrey, N.L.'}</p>
        ${details.length ? `<div class="card-details">${details.join('')}</div>` : ''}
      </div>
    </div>`;
}

// ─── Bookmark button init ───────────────────────────────────────────

function initBookmarkButtons() {
  document.querySelectorAll('.btn-bookmark').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.id;
      toggleBookmark(id);
      const saved = isBookmarked(id);
      btn.classList.toggle('saved', saved);
      btn.querySelector('i').className = `fa-${saved ? 'solid' : 'regular'} fa-bookmark`;
      updateBookmarkCount();
    });
  });
}

// ─── Navbar active link ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').split('?')[0];
    link.classList.toggle('active', href === current);
  });

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
  }

  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50);
  });

  updateBookmarkCount();
});
