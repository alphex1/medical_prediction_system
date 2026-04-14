/**
 * db.js — lightweight localStorage "database"
 * Drop-in replacement: swap fetch() calls for a real API later.
 *
 * Tables
 *   users       : { [email]: { email, name, passwordHash, createdAt } }
 *   predictions : { [email]: Prediction[] }
 *   session     : { email, name }
 */

const KEYS = {
  USERS:       'medipredict_users',
  PREDICTIONS: 'medipredict_predictions',
  SESSION:     'medipredict_session',
};

// ── helpers ──────────────────────────────────────────────────────────────────
function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/** Tiny hash — NOT cryptographic; replace with bcrypt on a real server */
function hashPassword(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  return h.toString(16);
}

// ── users ─────────────────────────────────────────────────────────────────────
function getUsers() { return load(KEYS.USERS) || {}; }
function saveUsers(users) { save(KEYS.USERS, users); }

/**
 * Register a new user.
 * Returns { ok: true, user } or { ok: false, error: string }
 */
function register({ name, email, password }) {
  const users = getUsers();
  if (users[email]) return { ok: false, error: 'An account with this email already exists.' };
  const user = { email, name, passwordHash: hashPassword(password), createdAt: new Date().toISOString() };
  users[email] = user;
  saveUsers(users);
  return { ok: true, user: { email, name } };
}

/**
 * Sign in.
 * Returns { ok: true, user } or { ok: false, error: string }
 */
function login({ email, password }) {
  const users = getUsers();
  const record = users[email];
  if (!record) return { ok: false, error: 'No account found with this email.' };
  if (record.passwordHash !== hashPassword(password))
    return { ok: false, error: 'Incorrect password. Please try again.' };
  return { ok: true, user: { email, name: record.name } };
}

// ── session ───────────────────────────────────────────────────────────────────
function getSession() { return load(KEYS.SESSION); }
function setSession(user) { save(KEYS.SESSION, user); }
function clearSession() { localStorage.removeItem(KEYS.SESSION); }

// ── predictions ───────────────────────────────────────────────────────────────
function getPredictions(email) {
  const all = load(KEYS.PREDICTIONS) || {};
  return all[email] || [];
}

function addPrediction(email, data) {
  const all = load(KEYS.PREDICTIONS) || {};
  const list = all[email] || [];
  list.unshift({ ...data, savedAt: new Date().toISOString(), id: Date.now() });
  all[email] = list.slice(0, 50); // keep last 50
  save(KEYS.PREDICTIONS, all);
}

function deletePrediction(email, id) {
  const all = load(KEYS.PREDICTIONS) || {};
  const list = (all[email] || []).filter(p => p.id !== id);
  all[email] = list;
  save(KEYS.PREDICTIONS, all);
}

export const db = {
  register, login,
  getSession, setSession, clearSession,
  getPredictions, addPrediction, deletePrediction,
};
