# maryam-yamna-ai

MARYAM YAMNA website with Llama AI chatbot integration.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000`.

## Llama configuration

This project forwards chat messages to an Ollama-compatible Llama API endpoint.

Environment variables:

- `OLLAMA_BASE_URL` (default: `http://localhost:11434`)
- `LLAMA_MODEL` (default: `llama3.2`)
- `PORT` (default: `3000`)
