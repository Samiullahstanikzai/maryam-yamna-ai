const express = require('express');
const path = require('path');

function createApp(options = {}) {
  const fetchImpl = options.fetchImpl || global.fetch;
  const ollamaBaseUrl = options.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const llamaModel = options.llamaModel || process.env.LLAMA_MODEL || 'llama3.2';

  if (typeof fetchImpl !== 'function') {
    throw new Error('Fetch implementation is required to call Llama API.');
  }

  const app = express();

  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/chat', async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    try {
      const response = await fetchImpl(`${ollamaBaseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: llamaModel,
          prompt: message,
          stream: false,
        }),
      });

      if (!response.ok) {
        return res.status(502).json({ error: 'Llama API request failed.' });
      }

      const data = await response.json();
      const reply = typeof data.response === 'string' ? data.response.trim() : '';

      if (!reply) {
        return res.status(502).json({ error: 'Llama API returned an empty response.' });
      }

      return res.json({ reply });
    } catch (_error) {
      return res.status(502).json({ error: 'Unable to reach Llama API.' });
    }
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = { createApp };
