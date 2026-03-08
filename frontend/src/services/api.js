const API_BASE = '';

export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });
  const body = await res.json();

  // Nếu 401 trên các endpoint KHÔNG phải login → auto logout
  if ((res.status === 401 || res.status === 403) && !path.includes('/auth/login')) {
    localStorage.removeItem('hg_token');
    localStorage.removeItem('hg_user');
    window.location.href = '/login';
  }

  return body;
}
