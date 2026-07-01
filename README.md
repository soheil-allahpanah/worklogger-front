# Worklogger Frontend

Desktop-first Next.js dashboard for the [Worklogger](../worklogger) Rust API.

## Features

- Login / logout (JWT + refresh tokens via httpOnly cookies)
- Worklog list with unified search/filter bar
- View, add, and delete worklogs
- Weekly time summary and active tags
- Clean Architecture layers (`entities` → `application` → `infrastructure` → `interface-adapters` → `app`)

## Prerequisites

- Node.js 20+
- Running Worklogger API (see `../worklogger`)

## Setup

```bash
cp .env.example .env.local
npm install
```

Configure `WORKLOGGER_API_URL` in `.env.local` to point at your Rust API (default `http://127.0.0.1:3000`).

Run Next.js on a **different port** than the API, e.g.:

```bash
npm run dev -- -p 3001
```

## Create a test user

Users are created via the admin CLI in the backend repo:

```bash
cd ../worklogger
cargo run -p admin -- create-user --name "John Doe" --email alice@team.local --password secret
```

## Run both services

```bash
# Terminal 1 — API
cd ../worklogger && cargo run -p api

# Terminal 2 — Frontend
cd ../worklogger-front && npm run dev -- -p 3001
```

Open [http://localhost:3001/login](http://localhost:3001/login).

## Architecture

```
app/                    Next.js pages, Server Actions, BFF route handlers
src/entities/           Zod models and domain errors
src/application/        Use cases and repository interfaces
src/infrastructure/     HTTP client, repositories, cookie auth
src/interface-adapters/ Controllers and presenters
src/di/                 Dependency injection container
components/             Presentation UI
```

Browser requests go to same-origin `/api/worklogs/*` BFF routes, which forward to the Rust API with the access token from cookies.

## Search syntax

The filter bar supports:

- Free text → description contains
- `#tag` → filter by tag
- `1403/06/01` → Jalali date filter
- `2h`, `30m` → duration filter

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint

## Docker

Build and run with the redeploy script (replaces any existing container and prunes the old image):

```bash
# API in Docker on the same network (matches worklogger-api container name)
DOCKER_NETWORK=worklogger-net \
WORKLOGGER_API_URL=http://worklogger-api:3000 \
./scripts/redeploy-worklogger-front.sh

# API on the host machine
USE_HOST_API=1 \
WORKLOGGER_API_URL=http://127.0.0.1:3000 \
./scripts/redeploy-worklogger-front.sh

# Env file for app vars (networking flags stay in the shell)
ENV_FILE=./front.env DOCKER_NETWORK=worklogger-net ./scripts/redeploy-worklogger-front.sh
```

Optional environment variables for the script:

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST_PORT` | `3001` | Host port published to the machine |
| `EXPOSED_PORT` | `3000` | Port the container listens on (Next.js `PORT`) |
| `CONTAINER_NAME` | `worklogger-front` | Docker container name |
| `DOCKER_NETWORK` | _(empty)_ | Attach to this network to reach the API container |
| `DOCKER_ENSURE_NETWORK` | `0` | Set to `1` to create `DOCKER_NETWORK` if missing |
| `USE_HOST_API` | `0` | Set to `1` when the API runs on the host (uses `host.docker.internal`) |

Open [http://localhost:3001/login](http://localhost:3001/login) after deploy.
