// Tests for the Phase 0 skeleton: the module auto-loader, the meta routes,
// the service registry stubs, serial numbers, and the secret hidden-detail answers.
// If any of these break, every module is affected, so they are checked on every run.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from './app.js';
import { registerService, resetServices, services } from './shared/services/registry.js';
import { nextSerial } from './shared/utils/serial.js';
import { FoundItem } from './shared/models/FoundItem.js';
import { startTestDb, stopTestDb } from './shared/testing/testDb.js';

let app;
let modules;

beforeAll(async () => {
  await startTestDb();
  ({ app, modules } = await createApp());
});
afterAll(stopTestDb);

describe('module auto-loader', () => {
  it('mounts all six modules', () => {
    const names = modules.map((mod) => mod.name);
    expect(names).toEqual(['auth', 'found', 'lost', 'meta', 'notifications', 'verify']);
  });

  it('answers unknown API paths with the standard error shape', async () => {
    const res = await request(app).get('/api/nothing-here');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('meta module', () => {
  it('returns locations and desks', async () => {
    const locations = await request(app).get('/api/meta/locations');
    expect(locations.body.buildings).toHaveLength(12);
    expect(locations.body.buildings[0].floors).toHaveLength(3);

    const desks = await request(app).get('/api/meta/desks');
    expect(desks.body.desks).toHaveLength(3);
  });
});

describe('service registry', () => {
  it('has a working stub for every service', async () => {
    await expect(services.notify({ userId: 'u1', type: 'MATCH_FOUND', title: 'Hi' })).resolves.toBe(
      undefined
    );
    await expect(services.runMatching({ foundItemId: 'f1' })).resolves.toEqual([]);
    const entry = await services.appendCustody({ itemId: 'f1', action: 'POSTED', actorId: 'u1' });
    expect(entry.action).toBe('POSTED');
    expect(services.getHiddenDetailPrompts('wallet')[0].promptKey).toBeTruthy();
  });

  it('swaps in a real implementation and refuses unknown names', async () => {
    registerService('runMatching', async () => ['match']);
    await expect(services.runMatching({ foundItemId: 'f1' })).resolves.toEqual(['match']);
    resetServices();
    expect(() => registerService('madeUp', () => {})).toThrow();
  });
});

describe('serial numbers and secrets', () => {
  it('counts up per kind with six digits', async () => {
    expect(await nextSerial('found')).toBe('PICT-F-000001');
    expect(await nextSerial('found')).toBe('PICT-F-000002');
    expect(await nextSerial('lost')).toBe('PICT-L-000001');
  });

  it('never loads hidden-detail answers unless asked for', async () => {
    await FoundItem.create({
      serial: 'PICT-F-900000',
      finderId: new mongoose.Types.ObjectId(),
      category: 'wallet',
      title: 'Brown wallet',
      hiddenDetails: [{ promptKey: 'cards', promptText: 'Which cards?', answer: 'SBI debit' }],
    });
    const normal = await FoundItem.findOne({ serial: 'PICT-F-900000' }).lean();
    expect(normal.hiddenDetails[0].answer).toBeUndefined();

    const forHandler = await FoundItem.findOne({ serial: 'PICT-F-900000' })
      .select('+hiddenDetails.answer')
      .lean();
    expect(forHandler.hiddenDetails[0].answer).toBe('SBI debit');
  });
});
