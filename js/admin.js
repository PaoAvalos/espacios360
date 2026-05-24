// ─── Admin authentication & CRUD (Supabase) ────────────────────────

async function adminLogin(email, password) {
  if (DEMO_MODE) {
    // Demo: any email + password "admin360" works
    if (password === 'admin360') {
      sessionStorage.setItem('e360_admin', '1');
      return { ok: true };
    }
    return { ok: false, message: 'Contraseña incorrecta (demo: admin360)' };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

async function adminLogout() {
  sessionStorage.removeItem('e360_admin');
  if (!DEMO_MODE) await supabase.auth.signOut();
  window.location.href = 'login.html';
}

async function isAdminLoggedIn() {
  if (DEMO_MODE) return sessionStorage.getItem('e360_admin') === '1';
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

async function requireAdmin() {
  const ok = await isAdminLoggedIn();
  if (!ok) window.location.href = 'login.html';
}

// ─── CRUD ──────────────────────────────────────────────────────────

async function saveProperty(data, id = null) {
  if (DEMO_MODE) {
    if (id) {
      const idx = MOCK_PROPERTIES.findIndex(p => p.id === id);
      if (idx !== -1) MOCK_PROPERTIES[idx] = { ...MOCK_PROPERTIES[idx], ...data };
    } else {
      MOCK_PROPERTIES.unshift({ ...data, id: String(Date.now()), created_at: new Date().toISOString() });
    }
    return { ok: true };
  }
  const payload = { ...data, updated_at: new Date().toISOString() };
  const query = id
    ? supabase.from('properties').update(payload).eq('id', id)
    : supabase.from('properties').insert(payload);
  const { error } = await query;
  return error ? { ok: false, message: error.message } : { ok: true };
}

async function deleteProperty(id) {
  if (DEMO_MODE) {
    const idx = MOCK_PROPERTIES.findIndex(p => p.id === id);
    if (idx !== -1) MOCK_PROPERTIES.splice(idx, 1);
    return { ok: true };
  }
  const { error } = await supabase.from('properties').delete().eq('id', id);
  return error ? { ok: false, message: error.message } : { ok: true };
}

async function updateStatus(id, status) {
  return saveProperty({ status }, id);
}

// ─── Image upload to Supabase Storage ──────────────────────────────

async function uploadImage(file) {
  if (DEMO_MODE) {
    // Return a fake URL in demo mode
    return { ok: true, url: URL.createObjectURL(file) };
  }
  const ext  = file.name.split('.').pop();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('properties').upload(name, file);
  if (error) return { ok: false, message: error.message };
  const { data } = supabase.storage.from('properties').getPublicUrl(name);
  return { ok: true, url: data.publicUrl };
}

// ─── Form helpers ──────────────────────────────────────────────────

function propertyFormData(form) {
  const fd = new FormData(form);
  const data = {};
  fd.forEach((v, k) => { data[k] = v === '' ? null : v; });
  // Parse numerics
  ['price','area_m2','bedrooms','bathrooms','parking','lat','lng']
    .forEach(f => { if (data[f]) data[f] = parseFloat(data[f]); });
  data.featured = form.querySelector('[name=featured]')?.checked || false;
  // Images handled separately
  delete data.image_files;
  return data;
}
