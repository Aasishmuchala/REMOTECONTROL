#!/usr/bin/env bash
# Install the IMPACT 3D 2.0 skill for Claude Code / Claude Desktop.
#   bash scripts/install-impact-3d.sh          # global: ~/.claude/skills (every project)
#   bash scripts/install-impact-3d.sh --local  # also copy into ./.claude/skills of the current dir
# Re-run after pulling to update. Remove with: rm -rf ~/.claude/skills/impact-3d-2-0
set -euo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_DIR/.claude/skills/impact-3d-2-0"
[ -f "$SRC/SKILL.md" ] || { echo "skill not found at $SRC" >&2; exit 1; }
GLOBAL="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
mkdir -p "$GLOBAL"; rm -rf "$GLOBAL/impact-3d-2-0"; cp -R "$SRC" "$GLOBAL/impact-3d-2-0"
echo "installed globally: $GLOBAL/impact-3d-2-0"
rm -rf "$GLOBAL/impact-3d" 2>/dev/null && echo "removed old global impact-3d" || true
if [ "${1:-}" = "--local" ]; then
  LOCAL="$PWD/.claude/skills"; mkdir -p "$LOCAL"; rm -rf "$LOCAL/impact-3d-2-0"; cp -R "$SRC" "$LOCAL/impact-3d-2-0"
  echo "installed locally:  $LOCAL/impact-3d-2-0"
fi
echo "done. Restart Claude Code / Claude Desktop, then type: /impact-3d-2-0 or just 'render this villa like Impact 3D'"
