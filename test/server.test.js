const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server');

test('POST /api/chat returns 400 when message is empty', async () => {
  const app = createApp({ fetchImpl: async () => ({ ok: true, json: async () => ({ response: 'ok' }) }) });
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' }),
    });

    assert.equal(response.status, 400);
  } finally {
    server.close();
  }
});

test('POST /api/chat forwards prompt and returns llama response', async () => {
  let fetchUrl = '';
  let fetchBody;

  const app = createApp({
    ollamaBaseUrl: 'http://ollama.local',
    llamaModel: 'llama3',
    fetchImpl: async (url, options) => {
      fetchUrl = url;
      fetchBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({ response: 'Hello from Llama' }),
      };
    },
  });

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hi there' }),
    });

    assert.equal(response.status, 200);
    assert.equal(fetchUrl, 'http://ollama.local/api/generate');
    assert.deepEqual(fetchBody, {
      model: 'llama3',
      prompt: 'Hi there',
      stream: false,
    });

    const data = await response.json();
    assert.equal(data.reply, 'Hello from Llama');
  } finally {
    server.close();
  }
});
