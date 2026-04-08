// ============================================================
// LawMate API Helper - included on every page
// ============================================================

// IMPORTANT: backend is running on port 5000
const API_BASE = 'http://localhost:5000/api';


// ── Token helpers ─────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('lawmate_token'),

  getUser: () => JSON.parse(localStorage.getItem('lawmate_user') || 'null'),

  setSession: (token, user) => {
    localStorage.setItem('lawmate_token', token);
    localStorage.setItem('lawmate_user', JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem('lawmate_token');
    localStorage.removeItem('lawmate_user');
  },

  isLoggedIn: () => !!localStorage.getItem('lawmate_token'),

  requireAuth: (role) => {
    const user = Auth.getUser();

    if (!user || !Auth.isLoggedIn()) {
      window.location.href = '/login.html';
      return null;
    }

    if (role && user.role !== role) {
      window.location.href = '/login.html';
      return null;
    }

    return user;
  }
};


// ── Core fetch wrapper ────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {

  const token = Auth.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(API_BASE + endpoint, {
    ...options,
    headers
  });

  let data;

  try {
    data = await res.json();
  } catch (err) {
    throw new Error('Server returned invalid response');
  }

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}


// ── Multipart (file upload) ───────────────────────────────────
async function apiUpload(endpoint, formData) {

  const token = Auth.getToken();

  const res = await fetch(API_BASE + endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  return data;
}


// ── Convenience methods ───────────────────────────────────────
const API = {

  // Auth
  login: (body) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  register: (body) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  me: () =>
    apiFetch('/auth/me'),

  updateProfile: (body) =>
    apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body)
    }),


  // Cases
  getCases: () => apiFetch('/cases'),

  getCase: (id) => apiFetch(`/cases/${id}`),

  createCase: (body) =>
    apiFetch('/cases', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  updateCase: (id, body) =>
    apiFetch(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  deleteCase: (id) =>
    apiFetch(`/cases/${id}`, {
      method: 'DELETE'
    }),


  // Hearings
  getHearings: () => apiFetch('/hearings'),

  createHearing: (body) =>
    apiFetch('/hearings', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  updateHearing: (id, body) =>
    apiFetch(`/hearings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  deleteHearing: (id) =>
    apiFetch(`/hearings/${id}`, {
      method: 'DELETE'
    }),


  // Documents
  getDocs: () => apiFetch('/documents'),

  uploadDoc: (fd) =>
    apiUpload('/documents/upload', fd),

  deleteDoc: (id) =>
    apiFetch(`/documents/${id}`, {
      method: 'DELETE'
    }),


  // Clients
  getClients: () => apiFetch('/clients'),

  approveClient: (id) =>
    apiFetch(`/clients/${id}/approve`, {
      method: 'PUT'
    }),

  rejectClient: (id) =>
    apiFetch(`/clients/${id}/reject`, {
      method: 'PUT'
    }),


  // Fees
  getFees: () => apiFetch('/fees'),

  createFee: (body) =>
    apiFetch('/fees', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  updateFee: (id, body) =>
    apiFetch(`/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),


  // Tasks
  getTasks: () => apiFetch('/tasks'),

  createTask: (body) =>
    apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  updateTask: (id, body) =>
    apiFetch(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  deleteTask: (id) =>
    apiFetch(`/tasks/${id}`, {
      method: 'DELETE'
    }),


  // Notifications
  getNotifications: () => apiFetch('/notifications'),

  markRead: (id) =>
    apiFetch(`/notifications/${id}/read`, {
      method: 'PUT'
    }),

  markAllRead: () =>
    apiFetch('/notifications/read-all', {
      method: 'PUT'
    })
};


// ── UI helpers ────────────────────────────────────────────────
function showToast(msg, type = 'success') {

  let t = document.getElementById('_toast');

  if (!t) {
    t = document.createElement('div');
    t.id = '_toast';

    t.style.cssText =
      'position:fixed;bottom:24px;right:24px;z-index:9999;padding:14px 20px;border-radius:10px;font-size:14px;font-weight:600;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.15);transition:opacity .3s;max-width:320px;';

    document.body.appendChild(t);
  }

  t.textContent = msg;
  t.style.background = type === 'success' ? '#16a34a' : '#dc2626';
  t.style.opacity = '1';

  clearTimeout(t._timer);

  t._timer = setTimeout(() => {
    t.style.opacity = '0';
  }, 3500);
}


function formatDate(d) {
  if (!d) return '—';

  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}


function formatMoney(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}


// ── Notification counter ──────────────────────────────────────
async function loadNotifCount() {
  try {

    const { notifications } = await API.getNotifications();

    const unread = notifications.filter(n => !n.is_read).length;

    const dot = document.querySelector('.notif-dot');

    if (dot) {
      dot.style.display = unread > 0 ? 'block' : 'none';
    }

  } catch (err) {
    console.error('Notification error:', err);
  }
}