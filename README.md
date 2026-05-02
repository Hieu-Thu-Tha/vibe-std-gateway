# vibe-std-gateway

Bare-bones Node HTTP gateway for AI providers.

## Setup

1. Install dependencies:

```sh
npm install
```

2. Set environment variables in Render or local `.env`.

## Development

```sh
npm run dev
```

## Deploy on Render

Use these settings in a Render Web Service:

```sh
Build Command: npm install
Start Command: npm start
```

## API

GET /health
- Returns `{ "ok": true }`

POST /api/execute
- Body: `{"command":"..."}`
- Tries OpenRouter first, then Vercel AI SDK.
- Env vars:
	- `OPENROUTER_API_KEY`
	- `OPENROUTER_FREE_MODELS` (comma-separated)
	- `AI_GATEWAY_API_KEY` (or `VERCEL_AI_API_KEY` fallback)
	- `VERCEL_AI_MODELS` (comma-separated)
	- `VERCEL_AI_DISCOVER_MODELS=true` (optional, uses `gateway.getAvailableModels`)
	- `SYSTEM_VIBE`
