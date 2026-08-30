const BASE = '/api';

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function request(path, options = {}) {
  const isMutating = options.method && options.method !== 'GET';
  const headers = { ...(options.headers || {}) };

  if (isMutating) {
    const token = getCookie('csrf_token');
    if (token) headers['x-csrf-token'] = token;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export function primeCsrf() {
  return request('/health');
}

export function getBoards() {
  return request('/boards');
}

export function getBoard(slug) {
  return request(`/boards/${slug}`);
}

export function getThreads(boardSlug) {
  return request(`/boards/${boardSlug}/threads`);
}

export function getThread(threadId) {
  return request(`/boards/threads/${threadId}`);
}

export function createThread(boardSlug, formData) {
  return request(`/boards/${boardSlug}/threads`, {
    method: 'POST',
    body: formData,
  });
}

export function createPost(threadId, formData) {
  return request(`/threads/${threadId}/posts`, {
    method: 'POST',
    body: formData,
  });
}

export function adminLogin(username, password) {
  return request('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export function adminLogout() {
  return request('/admin/logout', { method: 'POST' });
}

export function adminMe() {
  return request('/admin/me');
}

export function deleteThread(threadId) {
  return request(`/admin/threads/${threadId}`, { method: 'DELETE' });
}

export function deletePost(postId) {
  return request(`/admin/posts/${postId}`, { method: 'DELETE' });
}

export function banPoster(postId, reason, durationHours) {
  return request(`/admin/posts/${postId}/ban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, durationHours }),
  });
}

export function listBans() {
  return request('/admin/bans');
}

export function liftBan(banId) {
  return request(`/admin/bans/${banId}`, { method: 'DELETE' });
}
