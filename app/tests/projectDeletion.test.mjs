import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteSavedProject } from '../src/utils/projectGalleryLogic.js';
import { createAppSnapshot, validateAppSnapshot } from '../src/utils/projectPersistence.js';

const makeProject = (id) => ({id, name: `Project ${id}`, messages: [],
  exploration: {}, intentions: { initialBrief: '', preferences: [] },
  refinement: { working: { objects: { name: { text: `Name ${id}`, rotation: id * 15 } } } }});
const baseline = () => ({projects: [makeProject(1), makeProject(2), makeProject(3)],
  activeId: 2, openProjectIds: [1, 2, 3], communityReturnProjectId: 2,
  communityState: { saved: { artA: ['colour'] }, connectionNotice: { projectId: 2 },
    transferRequest: { targetProjectId: 2 }, view: 'gallery' }});

test('delete removes only the targeted project and protects other editable copies', () => {
  const state = baseline();
  const result = deleteSavedProject(state, 2);
  assert.equal(result.deleted, true);
  assert.deepEqual(result.projects.map(p=>p.id), [1,3]);
  assert.equal(result.projects[0], state.projects[0]);
  assert.equal(result.projects[1].refinement.working.objects.name.rotation,45);
  assert.equal(state.projects.length, 3); // no mutation
  assert.deepEqual(result.openProjectIds, [1,3]);
  assert.equal(result.activeId,3);
});

test('delete an inactive project keeps the existing active tab', () => {
  const result = deleteSavedProject(baseline(), 1);
  assert.equal(result.activeId, 2);
  assert.deepEqual(result.openProjectIds, [2,3]);
  assert.equal(result.communityReturnProjectId,2);
});

test('delete clears project-linked Community transient state without deleting saved inspiration', () => {
  const result = deleteSavedProject(baseline(), 2);
  assert.equal(result.communityReturnProjectId,null);
  assert.equal(result.communityState.connectionNotice,null);
  assert.equal(result.communityState.transferRequest,null);
  assert.deepEqual(result.communityState.saved, { artA: ['colour'] });
});

test('delete a project with no linked notices preserves Community collection reference', () => {
  const state = baseline();
  const result = deleteSavedProject(state, 1);
  assert.equal(result.communityState,state.communityState);
});

test('delete the last project produces a valid zero-project snapshot', () => {
  const state = {...baseline(), projects: [makeProject(2)], openProjectIds: [2]};
  const result = deleteSavedProject(state,2);
  assert.deepEqual(result.projects,[]);
  assert.deepEqual(result.openProjectIds,[]);
  assert.equal(result.activeId,null);
  const saved=createAppSnapshot({...result,activeWorkspace:'projects'});
  const restored=validateAppSnapshot(JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(restored.projects,[]);
  assert.equal(restored.activeId,null);
  assert.equal(restored.activeWorkspace,'projects');
});

test('attempted delete of a missing project is a no-op', () => {
  const state=baseline();
  const result=deleteSavedProject(state,88);
  assert.equal(result.deleted,false);
  assert.equal(result.projects,state.projects);
  assert.equal(result.communityState,state.communityState);
});

test('closing a tab leaves the saved project; deletion filters it', () => {
  const state={...baseline(),openProjectIds:[1,3],activeId:1};
  assert.equal(state.projects.length,3); // existing close-tab behaviour
  const result=deleteSavedProject(state,2);
  assert.equal(result.projects.length,2);
  assert.deepEqual(result.openProjectIds,[1,3]);
});

test('deleted project stays absent when saved snapshot is restored from browser storage', async () => {
  const { writeEmergencyBrowserBackup, loadSavedAppSnapshot } = await import('../src/utils/projectPersistence.js');
  const map = new Map();
  const old = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key,value),
  };
  try {
    const result = deleteSavedProject(baseline(), 2);
    const snapshot = createAppSnapshot({ ...result, activeWorkspace: 'projects' });
    assert.equal(writeEmergencyBrowserBackup(snapshot), true);
    const loaded = await loadSavedAppSnapshot();
    assert.deepEqual(loaded.projects.map(p => p.id), [1,3]);
    assert.equal(loaded.activeId,3);
    assert.deepEqual(loaded.openProjectIds,[1,3]);
  } finally {
    if (old === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = old;
  }
});
