---
title: "A coding agent on the Mac's own model: Pi on the Enigmus LLM Server"
date: 2026-10-15T12:00:00Z
image: /images/pi-coding-agent-cover.webp
image_alt: "Terminal window running pi -p against the Enigmus LLM Server: the prompt asks to fix a failing test, and the reply from Qwen 3.5 9B names the off-by-one divisor in calc.py and reports that the test now passes"
categories: ["Pi", "MLX", "benchmarks"]
featured: false
draft: true
---

Enigmus 1.3 adds an LLM Server: a switch in the app that serves the loaded model over an OpenAI-compatible endpoint, with tool calling on the Qwen 3.5 2B, 4B and 9B. A coding agent needs exactly that: it works through a task by asking the model for a step, running it (reading a file, running a command, editing code) and sending back the result, turn after turn. [Pi](https://pi.dev) is an open-source coding agent for the terminal, with a small core that packages extend.

On a local model, every token in that loop costs time. On a 16 GB M1 Pro, Qwen 3.5 9B reads its prompt at about 160 tokens per second. The agent resends the whole conversation on every turn, instructions and tool definitions included, and Enigmus reads it from the start each time. The 9B needs 10.3 s to read Pi's first request and 46.2 s for [opencode](https://opencode.ai)'s. This post covers why Pi fits a local model, how to set it up so the model calls stay on the Mac, and a Pi package for search that earns back the tokens it adds.

## Why Pi fits a local model

Pi keeps its instructions and tool definitions small on purpose: its first request is 1,599 tokens against opencode's 7,434. Its site calls it "a minimal agent harness" whose "minimal system prompt" leaves room for "actual context engineering". It turns on four tools by default, `read`, `bash`, `edit` and `write`, where opencode sends ten.

Context files count too. Pi adds every `AGENTS.md` or `CLAUDE.md` in `~/.pi/agent/`, the project and its parent folders, plus the skills it finds, and all of it is part of every request. `pi -nc` skips context files and `pi -ns` skips skills.

## Setup in four steps

**1. Turn on the server.** The LLM Server row at the top of the Enigmus sidebar opens its settings, and switching on Active serves the loaded model at `http://127.0.0.1:31415/v1`, reachable from the same Mac.

<img src="/images/pi-coding-agent-sidebar.webp" alt="Top of the Enigmus sidebar on macOS: the tinted LLM Server row, reading Active and port 31415" style={{maxWidth: '230px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

<img src="/images/pi-coding-agent-server.webp" alt="Enigmus LLM Server settings on macOS: Active switched on, model Qwen 3.5 9B-4bit, endpoint address 127.0.0.1 port 31415 and base URL http://127.0.0.1:31415/v1" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

**2. Install Pi.**

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

The runs in this post used Pi 1.2.0 and 1.3.0, which send the same first request.

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
          "thinkingLevelMap": { "off": null, "minimal": null, "low": null, "medium": null },
          "contextWindow": 32768,
          "maxTokens": 8192
        }
      ]
    }
  }
}
```

The server has no API key, so any string works in `apiKey`.

Without `thinkingLevelMap`, Pi shows its default level, `medium`. The server ignores the level: it thinks on every request that carries tools, with no cap, so every level from `off` up behaves the same. The map leaves Pi only `high`. Over four runs of the toy project below, the thinking stayed short: 27 to 236 characters per request.

`contextWindow` is a choice, not the model's 256K limit. Pi keeps 16,384 tokens in reserve (its default `reserveTokens`) and compacts the session once the rest fills up, so at 32,768 a session is compacted after about 16,384 tokens. The 16 GB M1 Pro still admitted a full 32K request: a 24,440-token prompt plus the 8,192-token reply.

**4. Run it.** One-shot mode prints only the final answer:

```bash
pi -p --model enigmus/mlx-community/Qwen3.5-9B-4bit \
  "test_calc.py fails. Fix the bug in calc.py and run the test."
```

On a two-file toy project with an off-by-one divisor, five runs in a row fixed the bug, each in six requests and 83 to 86 s. Without `-p`, `pi` opens an interactive session:

<img src="/images/pi-coding-agent-session.webp" alt="Interactive Pi 1.2.0 session on the toy project with Qwen 3.5 9B: the prompt asks to fix the failing test, the model reads test_calc.py and calc.py, edits the divisor from len(xs) + 1 to len(xs), gets command not found for python, runs python3 test_calc.py which prints ok, and answers that the bug is fixed; the footer reads 6.8%/33k" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

At startup the interactive session contacts pi.dev and GitHub for its model catalog and update checks, which `PI_OFFLINE=1 pi` skips. Watched with `nettop`, Pi's process connected only to 127.0.0.1:31415, both in a `-p` run and in an interactive session with `PI_OFFLINE=1`.

## Faster search with pi-fff

Pi installs extra tools as packages. Each one adds its tool definitions to every request, so it costs reading time on every turn. [`@ff-labs/pi-fff`](https://github.com/dmtrKovalenko/fff/tree/main/packages/pi-fff) 0.11.0 adds 1,060 tokens, and the first request stays far below opencode's:

<img src="/images/pi-coding-agent-first-request.webp" alt="Bar chart of the first request each setup sends to a local Qwen 3.5 9B, in tokens: Pi alone 1,599 with 4 tools, Pi plus pi-fff in override mode 2,659 with 6 tools, and opencode in its default setup 7,434 with 10 tools" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

Those tokens pay off when the model has to find code. Pi leaves `find` and `grep` off by default, so without a package the model searches through `bash`. In override mode, `pi-fff` supplies those two tools under their usual names. Asked "Which files in this project import sys?" in a small Python project with a `.venv`, the 9B on Pi alone ran `find` and `grep` through `bash`, listed files inside the `.venv` along the way, and took 4 to 8 requests. With `pi-fff`, one or two `grep` calls skipped the gitignored `.venv` and returned the three files with line numbers, in 2 or 3 requests:

<img src="/images/pi-coding-agent-fff-search.webp" alt="Bar chart of the time Qwen 3.5 9B took to answer which files in a Python project import sys, three runs each: with pi-fff 45 s in 2 requests, 42 s in 2 requests and 70 s in 3 requests; with Pi alone 203 s in 7 requests, 119 s in 4 requests and 157 s in 8 requests" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

It installs with one command. The second line switches `pi-fff` to override mode for every session; by default its tools are named `fffind` and `ffgrep`:

```bash
pi install npm:@ff-labs/pi-fff
echo '{"mode": "override"}' > ~/.pi/agent/pi-fff.json
```

## Additional useful packages

- [`pi-lens`](https://github.com/apmantza/pi-lens) runs linters and type checkers on every write and edit and hands the findings back to the model.
- [`pi-lean-edit`](https://github.com/sergiobonfiglio/pi-lean-edit) lets an edit name line ranges instead of resending the old text it replaces.

## Getting it

The LLM Server ships in Enigmus 1.3 for Mac on the [Mac App Store](https://apps.apple.com/us/app/enigmus/id6771532268?platform=mac). The Qwen 3.5 models download from the model list in the app. Pi is free and open source at [pi.dev](https://pi.dev).
