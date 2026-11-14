export const API = import.meta.env.VITE_API_URL || 'https://notemates-unt0.onrender.com';
export const getToken = () => localStorage.getItem('nm_t');
export async function api(path, { method = 'GET', body } = {}) {
  const t = getToken();
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let d = {}; try { d = await r.json() } catch { }
  if ((r.status === 401 || r.status === 403) && t) { window.dispatchEvent(new Event('nm-logout')); throw new Error('Session expired. Log in again.') }
  if (!r.ok) throw new Error(d.error || 'Request failed');
  return d;
}
export const wsUrl = id => API.replace(/^http/, 'ws') + `/?sessionId=${id}&token=${getToken()}`;
