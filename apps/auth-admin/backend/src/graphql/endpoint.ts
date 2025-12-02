import { api } from 'encore.dev/api';
import { server, HeaderMap } from './server';
import { json } from 'node:stream/consumers';

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
// Control whether this service emits Access-Control-Allow-Origin itself.
// Set CORS_EMIT_ORIGIN=false to let an upstream/gateway emit the header and avoid duplicates.
function envBool(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (raw == null) return defaultValue;
  const v = String(raw).trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'y' || v === 'on';
}
const emitCorsOrigin = envBool('CORS_EMIT_ORIGIN', false);
// Using upstream for Access-Control-Allow-Credentials

function setCorsHeaders(req: any, res: any) {
  // No-op: CORS is handled by upstream (Encore gateway/reverse proxy).
  // Avoid setting any Access-Control-* headers here to prevent duplicates.
}

export const graphql = api.raw({ expose: true, path: '/graphql', method: '*' }, async (req, res) => {
  // Handle preflight requests
  const method = (req.method ?? 'POST').toUpperCase();
  if (method === 'OPTIONS') {
    // For preflight, set CORS and exit early
    setCorsHeaders(req, res);
    res.statusCode = 204;
    res.end();
    return;
  }

  // Ensure server is ready
  server.assertStarted('/graphql');

  // Copy request headers into Apollo HeaderMap
  const headers = new HeaderMap();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  // Compute search from URL
  const search = new URL(req.url ?? '/', 'http://localhost').search;

  // Build body only for methods that may have one
  const body = method === 'GET' || method === 'HEAD' ? undefined : await json(req as any);

  const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      headers,
      method,
      body,
      search,
    },
    context: async () => ({ req, res }),
  });

  // Write response headers and status
  for (const [key, value] of httpGraphQLResponse.headers) {
    // Skip CORS headers from inner response; we set a single, canonical set below.
    const k = String(key).toLowerCase();
    if (
      k === 'access-control-allow-origin' ||
      k === 'access-control-allow-methods' ||
      k === 'access-control-allow-headers' ||
      k === 'access-control-allow-credentials' ||
      k === 'access-control-max-age'
    ) {
      continue;
    }
    res.setHeader(key, value);
  }
  // CORS headers are managed by upstream; do not set or modify here.

  res.statusCode = httpGraphQLResponse.status || 200;

  // Write body (single-shot or chunked)
  if (httpGraphQLResponse.body.kind === 'complete') {
    res.end(httpGraphQLResponse.body.string);
    return;
  }

  for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
    res.write(chunk);
  }
  res.end();
});
