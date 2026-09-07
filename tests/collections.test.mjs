import assert from 'node:assert/strict';
import { test } from 'node:test';
import api from '../src/api/api.ts';
import { fetchCollection } from '../src/api/collections.ts';
import { statusKey, statusInfo } from '../src/types/logistics.ts';

test('loads every API page so filters and totals include records beyond the first page', async () => {
  const original = api.get;
  const calls = [];
  api.get = async (_, config) => {
    calls.push(config.params.page);
    return { data: { data: config.params.page === 1 ? [{ _id: 'one' }, { _id: 'two' }] : [{ _id: 'three' }], total: 3 } };
  };
  try {
    assert.deepEqual(await fetchCollection('/vehicles'), [{ _id: 'one' }, { _id: 'two' }, { _id: 'three' }]);
    assert.deepEqual(calls, [1, 2]);
  } finally { api.get = original; }
});
test('supports the array returned by the active shipments API', async () => {
  const original = api.get;
  api.get = async () => ({ data: [{ _id: 'shipment', status: 'in_transit' }] });
  try { assert.equal((await fetchCollection('/shipments'))[0].status, 'in_transit'); }
  finally { api.get = original; }
});
test('does not silently display incomplete totals when a page is missing', async () => {
  const original = api.get;
  api.get = async () => ({ data: { data: [], total: 5 } });
  try { await assert.rejects(fetchCollection('/vehicles'), /completamente/); }
  finally { api.get = original; }
});
test('Portuguese and English shipment statuses map to the same filters and indicators', () => {
  for (const [legacy, current] of [['Pendente', 'pending'], ['Em Transito', 'in_transit'], ['Entregue', 'delivered'], ['Cancelada', 'cancelled']]) {
    assert.equal(statusKey(legacy), statusKey(current));
    assert.ok(statusInfo[statusKey(legacy)].label);
  }
});
