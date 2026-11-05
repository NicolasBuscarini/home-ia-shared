/**
 * Emissor de eventos de navegador do EventStore (T17-D).
 *
 * O navegador é complementar e nunca autoritativo: o servidor deriva ator/sessão e só aceita
 * `navigation.*`/`ui.*` de sessão same-origin. Falha de envio é silenciosa para o usuário e
 * permanece observável em `getStats()`; a fila é limitada para não crescer sem controle.
 */

export const PLATFORM_EVENT_SCHEMA_VERSION = '1.0';
export const PLATFORM_EVENT_ENDPOINT = '/api/v1/events';

export type BrowserEventType = 'navigation.viewed' | 'ui.action';

export interface PlatformEventReference {
  type: string;
  publicId: string;
}

export interface BrowserEventInput {
  eventType: BrowserEventType;
  correlationId?: string;
  resource?: PlatformEventReference;
  metadata?: Record<string, string | number | boolean>;
}

export interface PlatformEventEmitterStats {
  pending: number;
  inFlight: number;
  sent: number;
  failed: number;
  dropped: number;
}

export interface PlatformEventEmitterOptions {
  fetch?: typeof fetch;
  endpoint?: string;
  now?: () => number;
  createId?: () => string;
  maximumQueue?: number;
  maximumInFlight?: number;
}

export interface PlatformEventEmitter {
  emit(input: BrowserEventInput): void;
  getStats(): PlatformEventEmitterStats;
}

const MAXIMUM_QUEUE = 20;
const MAXIMUM_IN_FLIGHT = 2;

function randomHex(): string {
  const crypto = globalThis.crypto;
  if (crypto?.randomUUID) return crypto.randomUUID().replaceAll('-', '');
  const bytes = new Uint8Array(16);
  if (crypto?.getRandomValues) crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index++) bytes[index] = Math.random() * 256;
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Correlation id com o formato aceito pela ingestão (8–128 caracteres opacos). */
export function createCorrelationId(createId: () => string = randomHex): string {
  return createId();
}

export function createPlatformEventEmitter(options: PlatformEventEmitterOptions = {}): PlatformEventEmitter {
  const send = options.fetch ?? globalThis.fetch?.bind(globalThis);
  const endpoint = options.endpoint ?? PLATFORM_EVENT_ENDPOINT;
  const now = options.now ?? Date.now;
  const createId = options.createId ?? randomHex;
  const maximumQueue = options.maximumQueue ?? MAXIMUM_QUEUE;
  const maximumInFlight = options.maximumInFlight ?? MAXIMUM_IN_FLIGHT;
  const queue: string[] = [];
  const stats: PlatformEventEmitterStats = { pending: 0, inFlight: 0, sent: 0, failed: 0, dropped: 0 };

  function snapshot(): PlatformEventEmitterStats {
    return { ...stats, pending: queue.length };
  }

  async function deliver(body: string, correlationId: string): Promise<void> {
    stats.inFlight++;
    try {
      if (!send) {
        stats.failed++;
        return;
      }
      const response = await send(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
        body,
        credentials: 'same-origin',
        cache: 'no-store',
        keepalive: true,
      });
      if (response.ok) stats.sent++;
      else stats.failed++;
    } catch {
      stats.failed++;
    } finally {
      stats.inFlight--;
    }
  }

  function drain(): void {
    while (stats.inFlight < maximumInFlight && queue.length > 0) {
      const entry = queue.shift();
      if (!entry) return;
      const parsed = JSON.parse(entry) as { correlationId: string };
      void deliver(entry, parsed.correlationId).finally(drain);
    }
  }

  function emit(input: BrowserEventInput): void {
    if (queue.length >= maximumQueue) {
      stats.dropped++;
      return;
    }
    const correlationId = input.correlationId ?? createCorrelationId(createId);
    const event = {
      schemaVersion: PLATFORM_EVENT_SCHEMA_VERSION,
      eventId: createId(),
      eventType: input.eventType,
      category: 'navigation',
      severity: 'info',
      outcome: 'success',
      occurredAtUtc: new Date(now()).toISOString(),
      source: 'shell',
      emitter: 'browser',
      correlationId,
      ...(input.resource ? { resource: input.resource } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {}),
    };
    queue.push(JSON.stringify(event));
    drain();
  }

  return { emit, getStats: snapshot };
}
