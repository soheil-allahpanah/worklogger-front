#!/usr/bin/env bash
set -euo pipefail

# Rebuild worklogger-front, replace the running container, and prune the old image.
#
# Scenarios (WORKLOGGER_API_URL host + optional flags):
#
#   API on the host machine (not in Docker):
#     USE_HOST_API=1 WORKLOGGER_API_URL='http://127.0.0.1:3000' ./scripts/redeploy-worklogger-front.sh
#     (127.0.0.1 / localhost in WORKLOGGER_API_URL are rewritten to host.docker.internal)
#
#   API in another Docker container (same network; use the API container name as host):
#     DOCKER_NETWORK=worklogger-net WORKLOGGER_API_URL='http://worklogger-api:3000' ./scripts/redeploy-worklogger-front.sh
#
#   Env file (app vars only; networking flags stay as shell env):
#     ENV_FILE=./front.env DOCKER_NETWORK=worklogger-net ./scripts/redeploy-worklogger-front.sh
#
# Required runtime var: WORKLOGGER_API_URL. Can live in ENV_FILE or the shell.
# Optional: EXPOSED_PORT (container listen port), HOST_PORT (host publish port).

# --- Image / container ---
IMAGE_NAME="${IMAGE_NAME:-worklogger-front}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
CONTAINER_NAME="${CONTAINER_NAME:-worklogger-front}"
HOST_PORT="${HOST_PORT:-3001}"
EXPOSED_PORT="${EXPOSED_PORT:-3000}"

# --- API / networking ---
# Path to a file with runtime env vars (e.g. WORKLOGGER_API_URL). Do not put DOCKER_NETWORK here.
ENV_FILE="${ENV_FILE:-}"
# Attach the frontend container to this Docker network (for an API running in another container).
DOCKER_NETWORK="${DOCKER_NETWORK:-}"
# Create DOCKER_NETWORK if it does not exist (set to 1 to enable).
DOCKER_ENSURE_NETWORK="${DOCKER_ENSURE_NETWORK:-0}"
# Set to 1 when the API runs on the host: adds host.docker.internal and rewrites localhost in WORKLOGGER_API_URL.
USE_HOST_API="${USE_HOST_API:-0}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

read_env_value_from_file() {
  local file="$1"
  local want_key="$2"
  local line key value
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" ]] && continue
    if [[ "$line" != *=* ]]; then
      continue
    fi
    key="${line%%=*}"
    value="${line#*=}"
    key="${key%"${key##*[![:space:]]}"}"
    if [[ "$key" == "$want_key" ]]; then
      value="${value#\"}"
      value="${value%\"}"
      value="${value#\'}"
      value="${value%\'}"
      printf '%s' "$value"
      return 0
    fi
  done < "$file"
  return 1
}

resolve_env_value() {
  local var_name="$1"
  local shell_value="${!var_name:-}"

  if [[ -n "$shell_value" ]]; then
    printf '%s' "$shell_value"
    return 0
  fi
  if [[ -n "${ENV_FILE}" ]]; then
    read_env_value_from_file "${ENV_FILE}" "$var_name"
    return $?
  fi
  return 1
}

rewrite_api_url_for_host() {
  local url="$1"
  url="${url//127.0.0.1/host.docker.internal}"
  url="${url//localhost/host.docker.internal}"
  printf '%s' "$url"
}

is_truthy() {
  case "${1,,}" in
    1 | true | yes | on) return 0 ;;
    *) return 1 ;;
  esac
}

if ! RESOLVED_API_URL="$(resolve_env_value WORKLOGGER_API_URL)"; then
  echo "Error: set WORKLOGGER_API_URL or point ENV_FILE at a file containing it." >&2
  echo "  export WORKLOGGER_API_URL='http://worklogger-api:3000'" >&2
  echo "  or: ENV_FILE=/path/to/front.env $0" >&2
  exit 1
fi

if [[ -n "${ENV_FILE}" && ! -f "${ENV_FILE}" ]]; then
  echo "Error: ENV_FILE not found: ${ENV_FILE}" >&2
  exit 1
fi

if RESOLVED_EXPOSED_PORT="$(resolve_env_value EXPOSED_PORT)"; then
  EXPOSED_PORT="${RESOLVED_EXPOSED_PORT}"
fi

if RESOLVED_HOST_PORT="$(resolve_env_value HOST_PORT)"; then
  HOST_PORT="${RESOLVED_HOST_PORT}"
fi

if is_truthy "${USE_HOST_API}"; then
  RESOLVED_API_URL="$(rewrite_api_url_for_host "${RESOLVED_API_URL}")"
fi

if is_truthy "${DOCKER_ENSURE_NETWORK}" && [[ -n "${DOCKER_NETWORK}" ]]; then
  if ! docker network inspect "${DOCKER_NETWORK}" &>/dev/null; then
    echo "==> Creating Docker network ${DOCKER_NETWORK}..."
    docker network create "${DOCKER_NETWORK}"
  fi
fi

OLD_IMAGE_ID=""
if docker image inspect "${FULL_IMAGE}" &>/dev/null; then
  OLD_IMAGE_ID="$(docker image inspect -f '{{.Id}}' "${FULL_IMAGE}")"
fi

echo "==> Building ${FULL_IMAGE} (EXPOSED_PORT=${EXPOSED_PORT})..."
docker build -f Dockerfile --build-arg "EXPOSED_PORT=${EXPOSED_PORT}" -t "${FULL_IMAGE}" .

NEW_IMAGE_ID="$(docker image inspect -f '{{.Id}}' "${FULL_IMAGE}")"

echo "==> Stopping and removing old container (if any)..."
docker stop "${CONTAINER_NAME}" 2>/dev/null || true
docker rm "${CONTAINER_NAME}" 2>/dev/null || true

echo "==> Starting new container..."
RUN_ARGS=(
  -d
  --name "${CONTAINER_NAME}"
  --restart unless-stopped
  -p "${HOST_PORT}:${EXPOSED_PORT}"
)

if [[ -n "${ENV_FILE}" ]]; then
  RUN_ARGS+=(--env-file "${ENV_FILE}")
fi

# After --env-file so rewritten / shell values win over the file when both are set.
RUN_ARGS+=(-e "WORKLOGGER_API_URL=${RESOLVED_API_URL}")
RUN_ARGS+=(-e "EXPOSED_PORT=${EXPOSED_PORT}")
RUN_ARGS+=(-e "PORT=${EXPOSED_PORT}")

if [[ -n "${DOCKER_NETWORK}" ]]; then
  RUN_ARGS+=(--network "${DOCKER_NETWORK}")
fi

if is_truthy "${USE_HOST_API}"; then
  RUN_ARGS+=(--add-host=host.docker.internal:host-gateway)
fi

docker run "${RUN_ARGS[@]}" "${FULL_IMAGE}"

if [[ -n "${OLD_IMAGE_ID}" && "${OLD_IMAGE_ID}" != "${NEW_IMAGE_ID}" ]]; then
  echo "==> Removing previous image..."
  docker rmi "${OLD_IMAGE_ID}" || true
fi

docker image prune -f >/dev/null || true

echo "==> Done. Container status:"
docker ps --filter "name=${CONTAINER_NAME}"
echo "==> Frontend: http://127.0.0.1:${HOST_PORT}"
