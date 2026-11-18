/* Intenta local project persistence. No account, network calls or remote upload. */
export const PROJECT_SNAPSHOT_VERSION = 1;
export const LOCAL_SNAPSHOT_KEY = 'intenta:projects:v1';
const DATABASE_NAME = 'intenta-projects';
const DATABASE_STORE = 'snapshots';
const DATABASE_KEY = 'latest';
export const MAX_BACKUP_BYTES = 4 * 1024 * 1024;

const object = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const validId = (id) => Number.isSafeInteger(id) && id > 0;

export function isUsableProject(project) {
  return object(project) && validId(project.id) && typeof project.name === 'string' &&
    Array.isArray(project.messages) && object(project.exploration) &&
    object(project.intentions) && Array.isArray(project.intentions.preferences);
}

export function validateAppSnapshot(snapshot) {
  if (!object(snapshot) || snapshot.version !== PROJECT_SNAPSHOT_VERSION ||
      !Array.isArray(snapshot.projects) || snapshot.projects.length > 200 ||
      !snapshot.projects.every(isUsableProject)) return null;
  const ids = snapshot.projects.map((p) => p.id);
  if (new Set(ids).size !== ids.length) return null;
  const selectedId = ids.includes(snapshot.activeId) ? snapshot.activeId : null;
  const openIds = Array.isArray(snapshot.openProjectIds)
    ? [...new Set(snapshot.openProjectIds.filter((id) => ids.includes(id)))]
    : (selectedId === null ? [] : [selectedId]);
  if (selectedId !== null && !openIds.includes(selectedId)) openIds.push(selectedId);
  const workspace = ['design', 'community', 'projects'].includes(snapshot.activeWorkspace)
    ? snapshot.activeWorkspace : 'projects';
  return {
    version: PROJECT_SNAPSHOT_VERSION,
    savedAt: typeof snapshot.savedAt === 'string' ? snapshot.savedAt : new Date(0).toISOString(),
    projects: snapshot.projects,
    activeId: selectedId,
    openProjectIds: openIds,
    activeWorkspace: workspace,
    communityState: object(snapshot.communityState) ? snapshot.communityState : null,
    nextProjectId: Math.max(...ids, 0) + 1,
  };
}

export function createAppSnapshot({ projects, activeId, openProjectIds, activeWorkspace, communityState }) {
  const snapshot = {
    version: PROJECT_SNAPSHOT_VERSION,
    savedAt: new Date().toISOString(),
    projects,
    activeId,
    openProjectIds,
    activeWorkspace,
    communityState,
  };
  if (!validateAppSnapshot(snapshot)) throw new Error('Project state could not be validated for saving.');
  return snapshot;
}

function openDatabase() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is unavailable'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DATABASE_STORE)) request.result.createObjectStore(DATABASE_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Cannot open project storage'));
    request.onblocked = () => reject(new Error('Project storage is blocked by another tab'));
  });
}

async function readDatabase() {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(DATABASE_STORE, 'readonly');
      const request = tx.objectStore(DATABASE_STORE).get(DATABASE_KEY);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error || new Error('Unable to read projects'));
      tx.onerror = () => reject(tx.error || new Error('Storage read failed'));
    });
  } finally { db.close(); }
}

async function writeDatabase(snapshot) {
  const db = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DATABASE_STORE, 'readwrite');
      tx.objectStore(DATABASE_STORE).put(snapshot, DATABASE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Storage write failed'));
      tx.onabort = () => reject(tx.error || new Error('Storage write was cancelled'));
    });
  } finally { db.close(); }
}

export function writeEmergencyBrowserBackup(snapshot) {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(LOCAL_SNAPSHOT_KEY, JSON.stringify(snapshot));
    return true;
  } catch { return false; }
}

function readBrowserBackup() {
  try {
    const raw = localStorage.getItem(LOCAL_SNAPSHOT_KEY);
    return raw ? validateAppSnapshot(JSON.parse(raw)) : null;
  } catch { return null; }
}

export async function loadSavedAppSnapshot() {
  const local = readBrowserBackup();
  let database = null;
  try { database = validateAppSnapshot(await readDatabase()); } catch { /* Browser storage may be blocked. */ }
  if (!database) return local;
  if (!local) return database;
  return Date.parse(local.savedAt) >= Date.parse(database.savedAt) ? local : database;
}

export async function saveAppSnapshot(snapshot) {
  if (!validateAppSnapshot(snapshot)) throw new Error('Invalid project snapshot.');
  const fallbackSaved = writeEmergencyBrowserBackup(snapshot);
  try {
    await writeDatabase(snapshot);
    return { saved: true, method: 'indexeddb' };
  } catch (error) {
    if (fallbackSaved) return { saved: true, method: 'browser-backup' };
    throw new Error(`The project could not be saved on this device: ${error.message}`, { cause: error });
  }
}

export function makeEditableProjectBackup(project) {
  if (!isUsableProject(project)) throw new Error('This project cannot be backed up.');
  return JSON.stringify({ format: 'intenta-project-backup', version: 1, exportedAt: new Date().toISOString(), project }, null, 2);
}

export function parseEditableProjectBackup(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) {
    throw new Error('Project backup exceeds the 4 MB import limit.');
  }
  let document;
  try { document = JSON.parse(text); } catch { throw new Error('This is not a valid JSON project backup.'); }
  if (document?.format !== 'intenta-project-backup' || document?.version !== 1 || !isUsableProject(document.project)) {
    throw new Error('This file is not a supported Intenta project backup.');
  }
  return document.project;
}

export function importedProjectCopy(project, id) {
  if (!isUsableProject(project) || !validId(id)) throw new Error('Cannot import this project.');
  const now = new Date().toISOString();
  return { ...project, id, name: `${project.name.slice(0, 70)} (Imported)`, createdAt: now, updatedAt: now };
}

export function downloadEditableProjectBackup(project) {
  const contents = makeEditableProjectBackup(project);
  const blob = new Blob([contents], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stem = project.name.normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 42) || `project-${project.id}`;
  link.href = url;
  link.download = `${stem}.intenta.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
