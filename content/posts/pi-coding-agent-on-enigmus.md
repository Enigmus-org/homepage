---
title: "1,599 tokens or 7,434: the Pi coding agent on a local 9B"
date: 2026-10-15T12:00:00Z
image: /images/pi-coding-agent-cover.webp
image_alt: "Terminal window running pi -p against the Enigmus LLM Server: the prompt asks to fix a failing test, and the reply from Qwen 3.5 9B names the off-by-one divisor in calc.py and reports that the test now passes"
categories: ["Pi", "MLX", "benchmarks"]
featured: false
draft: true
---

The first request [Pi](https://pi.dev) sends to a local Qwen 3.5 9B is 1,599 tokens. [opencode](https://opencode.ai)'s is 7,434. A coding agent sends that part again on every turn, so on a 16 GB M1 Pro the model reads for 10.3 s with Pi and 46.2 s with opencode before it writes anything.

Enigmus has an LLM Server: a switch in the app that serves the loaded model over an OpenAI-compatible endpoint, with tool calling on the Qwen 3.5 2B, 4B and 9B. This post sets up Pi against it on a Mac with the 9B, then adds three Pi packages.

## Why Pi fits a local model

An agent sends the whole conversation again after every tool call, and Enigmus reads it from the start each time, at about 160 tokens per second for the 9B on this Mac. The agent's instructions and tool definitions ride along in every request.

Pi keeps that part small on purpose. Its site calls it "a minimal agent harness" whose "minimal system prompt" leaves room for "actual context engineering". It turns on four tools by default, `read`, `bash`, `edit` and `write`, where opencode sends ten.

Context files count too. Pi adds every `AGENTS.md` or `CLAUDE.md` in `~/.pi/agent/`, the project and its parent folders, plus the skills it finds. All of it rides in the first request, on every turn. `pi -nc` skips context files and `pi -ns` skips skills.

## Setup

**1. Turn on the server.** The LLM Server row at the top of the Enigmus sidebar opens its settings, and switching on Active serves the loaded model at `http://127.0.0.1:31415/v1`, reachable from the same Mac.

<img src="/images/pi-coding-agent-sidebar.webp" alt="Top of the Enigmus sidebar on macOS: the tinted LLM Server row, reading Active and port 31415" style={{maxWidth: '230px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

<img src="/images/pi-coding-agent-server.webp" alt="Enigmus LLM Server settings on macOS: Active switched on, model Qwen 3.5 9B-4bit, endpoint address 127.0.0.1 port 31415 and base URL http://127.0.0.1:31415/v1" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

**2. Install Pi.**

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

Every run in this post used Pi 1.2.0.

**3. Add Enigmus as a provider** in `~/.pi/agent/models.json` ([format](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/models.md)):

```json
{
  "providers": {
    "enigmus": {
      "baseUrl": "http://127.0.0.1:31415/v1",
      "api": "openai-completions",
      "apiKey": "enigmus",
      "models": [
        {
          "id": "mlx-community/Qwen3.5-9B-4bit",
          "name": "Qwen3.5 9B (Enigmus)",
          "reasoning": true,
          "contextWindow": 32768,
          "maxTokens": 8192
        }
      ]
    }
  }
}
```

The server has no API key, so any string works in `apiKey`. `reasoning` is `true` because the server turns thinking on whenever a request carries tools.

`contextWindow` is a choice, not the model's 256K limit. Pi compacts a session once it passes that number minus 16,384 tokens, so at 32,768 it compacts past 16,384. The 16 GB M1 Pro still admitted a full 32K request: a 24,440-token prompt plus the 8,192-token reply.

**4. Run it.** One-shot mode prints only the final answer:

```bash
pi -p --model enigmus/mlx-community/Qwen3.5-9B-4bit \
  "test_calc.py fails. Fix the bug in calc.py and run the test."
```

On a two-file toy project with an off-by-one divisor, five runs in a row fixed the bug, each in six requests and 83 to 86 s. Without `-p`, `pi` opens an interactive session:

<img src="/images/pi-coding-agent-session.webp" alt="Interactive Pi 1.2.0 session on the toy project with Qwen 3.5 9B: the prompt asks to fix the failing test, the model reads test_calc.py and calc.py, edits the divisor from len(xs) + 1 to len(xs), gets command not found for python, runs python3 test_calc.py which prints ok, and answers that the bug is fixed; the footer reads 6.8%/33k" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

At startup the interactive session contacts pi.dev and GitHub for its model catalog and update checks, which `PI_OFFLINE=1 pi` skips. Watched with `nettop`, Pi's process connected only to 127.0.0.1:31415, both in a `-p` run and in an interactive session with `PI_OFFLINE=1`.

## Three packages, all or a few

Pi installs extra tools as packages. Each of these three changes one part of how the model works with code, and each adds tokens to every request (versions tested: `pi-lean-edit` 0.3.6, `@ff-labs/pi-fff` 0.11.0, `pi-lens` 4.4.3):

- **`pi-lean-edit`**, +744 tokens. The harness checks that the model already read the text it edits, so an edit names line ranges instead of resending the old text, and one call can change several ranges. On a 45-line function rewrite, three runs each way, its edit calls came out 39 to 46% smaller than with Pi's own `edit`, and the runs took about as long: 262 to 329 s, against 258 to 337 s. Its 744 extra tokens ride on every request, so total prompt tokens per run still rose in two of the three pairs.
- **`@ff-labs/pi-fff`**, +1,060 tokens. An indexed, ranked file and content search. In override mode it takes over Pi's `find` and `grep`, two tools Pi leaves off by default.
- **`pi-lens`**, +3,213 tokens. LSP diagnostics as tools, a `read_symbol` tool that reads a single function or class instead of the whole file, and linters and type checkers that run on every write and edit. It downloads most of those tools from npm, PyPI or GitHub the first time a language needs them.

Each installs with one command. The last line switches `pi-fff` to override mode for every session; by default its tools are named `fffind` and `ffgrep`:

```bash
pi install npm:pi-lean-edit
pi install npm:@ff-labs/pi-fff
pi install npm:pi-lens
echo '{"mode": "override"}' > ~/.pi/agent/pi-fff.json
```

<img src="/images/pi-coding-agent-first-request.webp" alt="Bar chart of the first request each setup sends to a local Qwen 3.5 9B, in tokens: Pi alone 1,599 with 4 tools, Pi plus pi-lean-edit 2,343 with 4 tools, Pi plus pi-fff in override mode 2,659 with 6 tools, Pi plus pi-lens 4,812 with 12 tools, Pi plus all three 6,616 with 14 tools, and opencode in its default setup 7,434 with 10 tools" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

With all three, the first request is 6,616 tokens and 41.0 s of reading per turn, still under opencode's default. `pi-lens` alone triples the first request.

In one run, each `pi-lens` finding sent the model back for another edit. Asked to add a `median()` function to a five-line Python file with an unused `import os`, the 9B's first edit came back with "2 issue(s) must be fixed": the unused import and a blank line with trailing spaces. The model broke the file twice while fixing them, `pi-lens` reported each break, and the file came back clean 338 s after the prompt.

## Getting it

The LLM Server ships in Enigmus 1.3 for Mac on the [Mac App Store](https://apps.apple.com/us/app/enigmus/id6771532268?platform=mac). The Qwen 3.5 models download from the model list in the app. Pi is free and open source at [pi.dev](https://pi.dev).
