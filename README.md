# vibe-std-gateway

Serverless gateway functions for AI providers.

## Setup

1. Install Vercel CLI:

```sh
npm i -g vercel
```

2. Add Vercel Skills (for agents):

```sh
npx skills add vercel-labs/agent-skills
```

3. Link the project:

```sh
vercel link
```

## Development

```sh
vercel dev
```

## Deploy

```sh
vercel --prod
```

## API

GET /api/hello
- Fetches https://api.vercel.app/products and returns JSON.
- Source: api/hello.ts

POST /api/execute
- Body: {"command":"..."}
- Tries OpenRouter first, then Vercel AI SDK.
- Env vars:
	- OPENROUTER_API_KEY
	- OPENROUTER_FREE_MODELS (comma-separated)
	- AI_GATEWAY_API_KEY (or VERCEL_AI_API_KEY fallback)
	- VERCEL_AI_MODELS (comma-separated)
	- VERCEL_AI_DISCOVER_MODELS=true (optional, uses gateway.getAvailableModels)
	- SYSTEM_VIBE
