# Prime Agent on your Mac, running on Claude

[Prime Agent](https://github.com/PrimeIntellect-ai/prime-agent) is Prime Intellect's
open-source coding agent CLI. It is a standalone tool, like Claude Code, and it can use
Claude as its model through a Claude Pro/Max subscription or an Anthropic API key.

`install.sh` in this folder installs it and points it at Claude. It does what the official
installer (`curl -fsSL https://app.primeintellect.ai/prime-agent/install.sh | sh`) does,
without the animated UI, and falls back to the GitHub release when the official host is
unreachable.

## Install

```bash
cd prime-agent
./install.sh
```

The script:

1. Checks for `curl`, `git`, Node.js 22.8+ and npm. On a Mac with Homebrew it offers to
   run `brew install node` if Node is missing or too old.
2. Resolves the latest stable release, downloads `prime-agent-<version>.tgz` and
   `SHA256SUMS`, and verifies the checksum before installing anything.
3. Runs `npm install -g` on the verified tarball. This also prepares the Python kernel
   runtime (uv, Python 3.11, `prime-agent-runtime`) that Prime Agent uses as its one tool.
4. Adds a one-line shim for the Bedrock provider module that the 0.9.1 release bundle
   imports but does not ship. Without it Prime Agent crashes at startup on a machine that
   has AWS credentials in the environment.
5. Writes `defaultProvider: "anthropic"` to `~/.prime/agent/settings.json`, leaving any
   existing settings alone.

Options:

| Flag | Effect |
|------|--------|
| `--skip-python` | Skip the Python runtime now; Prime Agent builds it on first use |
| `--no-claude-config` | Do not touch `~/.prime/agent/settings.json` |
| `--model <id>` | Also set `defaultModel`, for example `--model claude-sonnet-4-5`. Use this if your shell has AWS credentials, otherwise Prime Agent may pick Bedrock over Anthropic |
| `<version>` | Install a specific version, for example `./install.sh 0.9.1` |

No sudo is needed when Node comes from Homebrew or nvm. The script never stores a
credential. During `npm install -g`, npm fetches Prime Agent's three sibling packages from
Prime Intellect's CDN (`pub-...r2.dev`), so that host must be reachable, as it is for the
official installer.

## Connect it to Claude

Pick one.

**Claude Pro/Max subscription**

```bash
cd /path/to/project
prime-agent
```

Type `/login`, choose **Claude Pro/Max**, and finish the sign-in in the browser. The token
is saved in `~/.prime/agent/auth.json` and refreshes itself. Per Prime Agent's docs,
third-party harness usage on a Claude subscription is billed per token from your Claude
"extra usage" balance, not from plan limits.

**Anthropic API key**

```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-...' >> ~/.zshrc
source ~/.zshrc
prime-agent
```

## Daily use

```bash
cd /path/to/project
prime-agent                 # interactive session in this directory
prime-agent -p "Explain the build setup"   # one-shot, print and exit
```

Inside a session:

- `/model` switches models; `prime-agent model list claude` lists the Claude ones.
- `/login` and `/logout` manage providers.
- `/refine` edits the persistent prompts and memories Prime Agent keeps for you.

Prime Agent reads `AGENTS.md` and `CLAUDE.md` from the project and its parents, so your
existing Claude Code instructions apply to it too.

Maintenance:

```bash
prime-agent doctor          # check the background services
prime-agent update          # upgrade to the latest release
prime-agent shutdown        # stop all agents and services
```

## Uninstall

```bash
prime-agent shutdown --force
npm uninstall -g prime-agent
rm -rf ~/.prime/agent       # settings, auth, sessions, kernel runtime
```

## Not for Claude Code web sessions

This is for your Mac. Claude Code's cloud containers block Prime Intellect's CDN and the
claude.ai OAuth endpoint, so neither the install nor the Pro/Max login completes there.

## Safety note

Prime Agent runs model-generated Python and shell commands with your user permissions. It is
not a sandbox. Run it in repositories you trust and keep them under version control.
