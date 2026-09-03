#!/usr/bin/env bash
#
# Install Prime Agent (https://github.com/PrimeIntellect-ai/prime-agent) on a
# Mac (or Linux) and set it up to use Claude as its model provider.
#
# What it does:
#   1. Checks for curl, git, Node.js >= 22.8 and npm (offers Homebrew install on macOS).
#   2. Resolves the latest stable release (or the version you pass).
#   3. Downloads the release tarball and SHA256SUMS, verifies the checksum.
#   4. Installs the `prime-agent` command with `npm install -g`, and prepares the
#      Python kernel runtime (uv + Python 3.11) unless --skip-python is given.
#   5. Sets Anthropic as the default provider in ~/.prime/agent/settings.json.
#   6. Tells you how to finish: `prime-agent` then `/login` -> Claude Pro/Max,
#      or export ANTHROPIC_API_KEY before launching.
#
# Usage:
#   ./install.sh [options] [version]
#
# Options:
#   --skip-python      Do not prepare the Python kernel runtime now (done lazily on first use)
#   --no-claude-config Do not touch ~/.prime/agent/settings.json
#   --model <id>       Also set defaultModel (for example claude-sonnet-4-5)
#   -h, --help         Show this help
#
# Environment overrides:
#   PRIME_AGENT_VERSION       Version to install (same as passing it as an argument)
#   PRIME_AGENT_INSTALL_DIR   Directory for the temporary download (default: mktemp)
#   PRIME_AGENT_TARBALL       Install from this local prime-agent-<version>.tgz instead of
#                             downloading; verified against a SHA256SUMS file next to it if present
#
# Works with the stock macOS bash 3.2. No sudo is needed when Node comes from
# Homebrew or nvm. Nothing here stores any credential.

set -euo pipefail

OFFICIAL_BASE_URL="https://app.primeintellect.ai/prime-agent"
GITHUB_REPO="PrimeIntellect-ai/prime-agent"
GITHUB_RELEASES_URL="https://github.com/${GITHUB_REPO}/releases/download"
GITHUB_REPO_URL="https://github.com/${GITHUB_REPO}"
FALLBACK_VERSION="0.9.1"   # last release known to this script; used only if lookups fail
MIN_NODE_MAJOR=22
MIN_NODE_MINOR=8

skip_python=0
configure_claude=1
default_model=""
requested_version="${PRIME_AGENT_VERSION:-}"
local_tarball="${PRIME_AGENT_TARBALL:-}"
tmp_dir=""

log()  { printf '\033[1m==>\033[0m %s\n' "$*"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '\033[33mwarning:\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  awk 'NR > 1 && /^#/ { sub(/^# ?/, ""); print; next } NR > 1 { exit }' "$0"
}

cleanup() {
  if [ -n "$tmp_dir" ] && [ -d "$tmp_dir" ]; then
    rm -rf "$tmp_dir"
  fi
}
trap cleanup EXIT

while [ $# -gt 0 ]; do
  case "$1" in
    --skip-python) skip_python=1 ;;
    --no-claude-config) configure_claude=0 ;;
    --model)
      [ $# -ge 2 ] || die "--model needs a value"
      default_model="$2"; shift ;;
    --model=*) default_model="${1#--model=}" ;;
    -h|--help) usage; exit 0 ;;
    -*) die "unknown option: $1 (see --help)" ;;
    *) requested_version="$1" ;;
  esac
  shift
done

# ---------------------------------------------------------------- preflight

os="$(uname -s)"
case "$os" in
  Darwin|Linux) ;;
  *) die "unsupported OS: $os (this script supports macOS and Linux)" ;;
esac

need_cmd() { command -v "$1" >/dev/null 2>&1; }

need_cmd curl || die "curl is required"
need_cmd git  || die "git is required (on macOS run: xcode-select --install)"

if need_cmd shasum; then
  sha256() { shasum -a 256 "$1" | awk '{print $1}'; }
elif need_cmd sha256sum; then
  sha256() { sha256sum "$1" | awk '{print $1}'; }
else
  die "shasum or sha256sum is required to verify the download"
fi

node_ok() {
  need_cmd node || return 1
  local v major minor
  v="$(node --version 2>/dev/null | sed 's/^v//')"
  major="${v%%.*}"
  minor="${v#*.}"; minor="${minor%%.*}"
  [ "${major:-0}" -gt "$MIN_NODE_MAJOR" ] || {
    [ "${major:-0}" -eq "$MIN_NODE_MAJOR" ] && [ "${minor:-0}" -ge "$MIN_NODE_MINOR" ]
  }
}

log "Checking Node.js and npm"
if ! node_ok; then
  if need_cmd node; then
    info "Found Node.js $(node --version), but ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}+ is required."
  else
    info "Node.js is not installed."
  fi
  if [ "$os" = "Darwin" ] && need_cmd brew; then
    if [ -t 0 ]; then
      printf '    Install Node.js with Homebrew now? [Y/n] '
      read -r answer
    else
      answer="y"
    fi
    case "$answer" in
      n|N|no|NO) die "install Node.js ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}+ and rerun this script" ;;
    esac
    brew install node
    hash -r
    node_ok || die "Node.js is still older than ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}; check 'which node' and your PATH"
  else
    die "install Node.js ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}+ (https://nodejs.org or 'brew install node') and rerun this script"
  fi
fi
need_cmd npm || die "npm was not found next to node"
info "Node.js $(node --version), npm $(npm --version)"

# ---------------------------------------------------------------- version

fetch() { curl -fsSL --connect-timeout 15 "$@"; }

resolve_version() {
  local v
  if [ -n "$requested_version" ]; then
    printf '%s' "${requested_version#v}"
    return
  fi
  # 1. Official stable channel file (plain-text version).
  if v="$(fetch "$OFFICIAL_BASE_URL/stable" 2>/dev/null | tr -d '[:space:]')" && [ -n "$v" ]; then
    printf '%s' "${v#v}"
    return
  fi
  # 2. Newest vX.Y.Z tag on GitHub (works where the web/API endpoints are blocked).
  if v="$(git ls-remote --tags "$GITHUB_REPO_URL" 2>/dev/null \
        | sed 's#.*refs/tags/##' \
        | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' \
        | sort -t. -k1,1n -k2,2n -k3,3n \
        | tail -1)" && [ -n "$v" ]; then
    printf '%s' "${v#v}"
    return
  fi
  warn "could not look up the latest release; falling back to v$FALLBACK_VERSION"
  printf '%s' "$FALLBACK_VERSION"
}

log "Resolving Prime Agent version"
if [ -n "$local_tarball" ]; then
  [ -f "$local_tarball" ] || die "PRIME_AGENT_TARBALL not found: $local_tarball"
  version="$(basename "$local_tarball" | sed -n 's/^prime-agent-\([0-9][0-9.]*\)\.tgz$/\1/p')"
  [ -n "$version" ] || die "PRIME_AGENT_TARBALL must be named prime-agent-<version>.tgz"
else
  version="$(resolve_version)"
fi
case "$version" in
  [0-9]*.[0-9]*.[0-9]*) ;;
  *) die "unexpected version string: '$version'" ;;
esac
info "Prime Agent v$version"

# ---------------------------------------------------------------- download

tarball_name="prime-agent-${version}.tgz"
if [ -n "${PRIME_AGENT_INSTALL_DIR:-}" ]; then
  mkdir -p "$PRIME_AGENT_INSTALL_DIR"
  tmp_dir="$(mktemp -d "$PRIME_AGENT_INSTALL_DIR/prime-agent-install.XXXXXX")"
else
  tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/prime-agent-install.XXXXXX")"
fi
tarball_path="$tmp_dir/$tarball_name"
sums_path="$tmp_dir/SHA256SUMS"

download_release() {
  local base="$1"
  fetch "$base/SHA256SUMS" -o "$sums_path" 2>/dev/null && fetch "$base/$tarball_name" -o "$tarball_path" 2>/dev/null
}

if [ -n "$local_tarball" ]; then
  log "Using local tarball"
  cp "$local_tarball" "$tarball_path"
  if [ -f "$(dirname "$local_tarball")/SHA256SUMS" ]; then
    cp "$(dirname "$local_tarball")/SHA256SUMS" "$sums_path"
  else
    warn "no SHA256SUMS next to $local_tarball; skipping checksum verification"
    sums_path=""
  fi
else
  log "Downloading $tarball_name"
  if download_release "$OFFICIAL_BASE_URL/releases/v$version"; then
    info "source: $OFFICIAL_BASE_URL"
  elif download_release "$GITHUB_RELEASES_URL/v$version"; then
    info "source: $GITHUB_RELEASES_URL (official host unreachable)"
  else
    die "could not download v$version from $OFFICIAL_BASE_URL or GitHub releases"
  fi
fi

if [ -n "$sums_path" ]; then
  log "Verifying SHA-256 checksum"
  expected="$(awk -v f="$tarball_name" '$2 == f {print $1}' "$sums_path")"
  [ -n "$expected" ] || die "SHA256SUMS has no entry for $tarball_name"
  actual="$(sha256 "$tarball_path")"
  [ "$expected" = "$actual" ] || die "checksum mismatch for $tarball_name
  expected: $expected
  actual:   $actual"
  info "ok $actual"
fi

# ---------------------------------------------------------------- install

log "Installing with npm install -g"
if [ "$skip_python" = 1 ]; then
  info "Python kernel runtime will be prepared on first use."
  env PRIME_AGENT_BOOTSTRAP_TOOLS_ON_INSTALL=1 \
    npm install -g --no-fund --no-audit --loglevel=error --progress=false "$tarball_path"
else
  info "Also preparing the Python kernel runtime (uv, Python 3.11, prime-agent-runtime)."
  env PRIME_AGENT_BOOTSTRAP_TOOLS_ON_INSTALL=1 \
      PRIME_AGENT_BOOTSTRAP_KERNEL_ON_INSTALL=1 \
      PRIME_AGENT_INSTALL_UV=1 \
    npm install -g --no-fund --no-audit --loglevel=error --progress=false "$tarball_path"
fi

hash -r
if ! need_cmd prime-agent; then
  npm_bin="$(npm prefix -g)/bin"
  warn "prime-agent installed to $npm_bin, which is not on your PATH."
  info "Add it, for example:  echo 'export PATH=\"$npm_bin:\$PATH\"' >> ~/.zshrc && source ~/.zshrc"
  export PATH="$npm_bin:$PATH"
fi
need_cmd prime-agent || die "prime-agent is still not runnable; check 'npm prefix -g'"
info "prime-agent $(prime-agent --version 2>&1 | tr -d '\n' || echo "v$version")"

# Work around a packaging gap in the release bundle: it lazily imports
# dist/bundle/amazon-bedrock.js, which the tarball does not ship, so Prime Agent
# crashes at startup on machines with AWS credentials in the environment
# (upstream issue #751). The unbundled module is present in the pi-ai
# dependency, so a one-line re-export at the expected path fixes it.
pkg_root="$(npm root -g)/prime-agent"
bedrock_shim="$pkg_root/dist/bundle/amazon-bedrock.js"
bedrock_impl="$pkg_root/node_modules/@earendil-works/pi-ai/dist/providers/amazon-bedrock.js"
if [ ! -f "$bedrock_shim" ] && [ -f "$bedrock_impl" ] && [ -d "$pkg_root/dist/bundle" ]; then
  printf 'export * from "../../node_modules/@earendil-works/pi-ai/dist/providers/amazon-bedrock.js";\n' > "$bedrock_shim"
  info "added Bedrock provider shim (release bundle omits amazon-bedrock.js)"
fi

# ---------------------------------------------------------------- Claude

if [ "$configure_claude" = 1 ]; then
  log "Setting Claude (Anthropic) as the default provider"
  settings_dir="$HOME/.prime/agent"
  settings_file="$settings_dir/settings.json"
  mkdir -p "$settings_dir"
  node - "$settings_file" "$default_model" <<'NODE'
const fs = require("node:fs");
const [file, model] = process.argv.slice(2);
let settings = {};
if (fs.existsSync(file)) {
  const raw = fs.readFileSync(file, "utf8");
  if (raw.trim()) {
    try { settings = JSON.parse(raw); }
    catch (e) { console.error(`    leaving ${file} untouched: not valid JSON (${e.message})`); process.exit(0); }
  }
}
const before = JSON.stringify(settings);
if (settings.defaultProvider && settings.defaultProvider !== "anthropic") {
  console.log(`    defaultProvider is already "${settings.defaultProvider}"; not changing it. Use /model inside prime-agent to switch.`);
} else {
  settings.defaultProvider = "anthropic";
}
if (model) settings.defaultModel = model;
if (JSON.stringify(settings) !== before) {
  fs.writeFileSync(file, JSON.stringify(settings, null, 2) + "\n");
  console.log(`    wrote ${file}`);
} else {
  console.log(`    ${file} already configured`);
}
NODE
fi

# ---------------------------------------------------------------- done

printf '\n'
log "Prime Agent v$version is installed"
printf '\n'
if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  info "ANTHROPIC_API_KEY is set in this shell; prime-agent will use it automatically."
  info "Make it permanent with:  echo 'export ANTHROPIC_API_KEY=...' >> ~/.zshrc"
else
  info "Connect it to Claude (pick one):"
  info "  a) Claude Pro/Max subscription:  run 'prime-agent', type /login, choose 'Claude Pro/Max',"
  info "     and finish the sign-in in your browser. Note: third-party harness usage is billed"
  info "     per token from your Claude 'extra usage' balance, not from plan limits."
  info "  b) Anthropic API key:  export ANTHROPIC_API_KEY=sk-ant-...   (add to ~/.zshrc)"
fi
printf '\n'
info "Then:  cd /path/to/project && prime-agent"
info "Useful:  prime-agent doctor   |   prime-agent update   |   /model to switch Claude models"
