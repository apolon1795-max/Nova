import { createServer, IncomingHttpHeaders } from 'node:http';
import { handler } from './index.js';

const port = Number(process.env.PORT || 8787);
process.env.LEAD_STORAGE_MODE = 'memory';

function flattenHeaders(headers: IncomingHttpHeaders): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(headers)) result[key] = Array.isArray(value) ? value[0] : value;
  return result;
}

const server = createServer((request, reply) => {
  const chunks: Buffer[] = [];
  request.on('data', (chunk: Buffer) => chunks.push(chunk));
  request.on('end', async () => {
    const functionResponse = await handler({
      httpMethod: request.method ?? 'GET',
      headers: flattenHeaders(request.headers),
      body: Buffer.concat(chunks).toString('utf8'),
      isBase64Encoded: false,
    });
    reply.writeHead(functionResponse.statusCode, functionResponse.headers);
    reply.end(functionResponse.body);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Novatoria quiz lead receiver is listening on http://127.0.0.1:${port}`);
});
