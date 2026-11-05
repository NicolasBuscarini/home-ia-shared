import assert from 'node:assert/strict';
import test from 'node:test';
import { createCorrelationId, createPlatformEventEmitter } from '../dist/services/events.js';

const flush = () => new Promise((resolve) => setImmediate(resolve));

function sequenceIds() {
  let value = 0;
  return () => (value++).toString(16).padStart(32, '0');
}

test('emite navigation.viewed com envelope de navegador e correlação no header', async () => {
  const requests = [];
  const emitter = createPlatformEventEmitter({
    fetch: async (url, init) => {
      requests.push({ url, init });
      return { ok: true };
    },
    now: () => Date.parse('2026-11-05T12:00:00Z'),
    createId: sequenceIds(),
  });

  emitter.emit({ eventType: 'navigation.viewed', resource: { type: 'module', publicId: 'monitoring' } });
  await flush();

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, '/api/v1/events');
  assert.equal(requests[0].init.method, 'POST');
  assert.equal(requests[0].init.credentials, 'same-origin');
  const body = JSON.parse(requests[0].init.body);
  assert.equal(body.schemaVersion, '1.0');
  assert.equal(body.eventType, 'navigation.viewed');
  assert.equal(body.category, 'navigation');
  assert.equal(body.severity, 'info');
  assert.equal(body.outcome, 'success');
  assert.equal(body.source, 'shell');
  assert.equal(body.emitter, 'browser');
  assert.equal(body.actor, undefined);
  assert.equal(body.occurredAtUtc, '2026-11-05T12:00:00.000Z');
  assert.deepEqual(body.resource, { type: 'module', publicId: 'monitoring' });
  assert.equal(requests[0].init.headers['X-Correlation-Id'], body.correlationId);
  assert.equal(emitter.getStats().sent, 1);
});

test('falha de envio é silenciosa e contabilizada em getStats', async () => {
  const emitter = createPlatformEventEmitter({
    fetch: async () => {
      throw new Error('offline');
    },
  });

  emitter.emit({ eventType: 'ui.action', metadata: { action: 'open' } });
  await flush();

  assert.equal(emitter.getStats().failed, 1);
  assert.equal(emitter.getStats().sent, 0);
});

test('resposta não-ok conta como falha sem lançar para o chamador', async () => {
  const emitter = createPlatformEventEmitter({ fetch: async () => ({ ok: false, status: 403 }) });

  emitter.emit({ eventType: 'ui.action' });
  await flush();

  assert.equal(emitter.getStats().failed, 1);
});

test('fila limitada descarta excedente e mantém a métrica', async () => {
  let release;
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  const emitter = createPlatformEventEmitter({
    fetch: async () => {
      await blocked;
      return { ok: true };
    },
    maximumQueue: 1,
    maximumInFlight: 1,
  });

  emitter.emit({ eventType: 'ui.action' });
  emitter.emit({ eventType: 'ui.action' });
  emitter.emit({ eventType: 'ui.action' });
  assert.equal(emitter.getStats().dropped, 1);
  release();
  await flush();
  await flush();
  assert.equal(emitter.getStats().sent, 2);
});

test('correlation id aceita gerador injetado', () => {
  assert.equal(
    createCorrelationId(() => 'abcdef01'),
    'abcdef01',
  );
  assert.match(createCorrelationId(), /^[0-9a-f]{32}$/);
});
