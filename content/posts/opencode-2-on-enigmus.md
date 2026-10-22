---
title: "Running opencode 2 on the Mac's own model with the Enigmus LLM Server"
date: 2026-10-21T12:00:00Z
image: /images/opencode-2-cover.webp
image_alt: "Bar chart of the first request each setup sends to a local Qwen 3.5 9B, in tokens: opencode 1.19 default 7,434 with 10 tools, opencode 2.1 default 5,538 with 12 tools, opencode 2.1 with six tools 2,354, and Pi 1,599 with 4 tools"
categories: ["opencode", "MLX", "benchmarks"]
featured: false
draft: true
---

[opencode](https://opencode.ai) is an open-source coding agent, now at version 2. Given a task, it asks a model for the next step (read a file, edit code, run a test), runs it and sends the result back until the task is done. It runs in the terminal, with desktop and web apps as well, and works with cloud models or any OpenAI-compatible server. That includes the Enigmus LLM Server, new in Enigmus 1.3, which serves the model loaded in the app, so every model call stays on the Mac.

A coding agent resends the whole conversation at every step. Cloud APIs keep the repeated part in a prompt cache; Enigmus reads the whole prompt on each request, at about 160 tokens per second with Qwen 3.5 9B on a 16 GB M1 Pro. So the agent's own instructions and tool definitions decide much of the speed, because they are read again on every step. opencode's defaults suit cloud APIs. Its first request, before it has read a single file, is 5,538 tokens, so here every step starts with 35 s or more of reading.

Six permission rules cut that first request to 2,354 tokens. On a two-file toy project, the 9B still finished the task in all five runs, in about half the time. This post covers where the tokens go and how to trim them, how compaction keeps a long session inside a 32K context, the full setup, and what leaves the Mac.

## Code Mode and the six-tool setup

Out of the box, opencode 2.1.2's first request is 25% smaller than version 1.19's, which the [Pi post](/posts/pi-coding-agent-on-enigmus) measured at 7,434 tokens. Its own instructions are short; most of the first request is the definitions of its twelve tools. Version 2 adds [Code Mode](https://opencode.ai/v2/docs/tools): a tool called `execute` that lets the model write JavaScript that calls several tools in one step. By default it is also the only way to reach two groups of tools: eight that manage opencode itself, such as its sessions and worktrees, and any from MCP servers, the plug-ins that add outside tools. `execute` and the catalog of tools behind it take about 1,500 tokens.

With no MCP servers connected, as here, the 9B never called `execute` in five default runs, yet those 1,500 tokens still added about 9 s of reading to every request. One permission rule removes Code Mode, along with every tool that goes through it. Five more remove tools this task never used:

- `websearch` and `webfetch` search the web and read pages from it.
- `subagent` hands part of a task to a second agent with a fresh context. Its definition is the largest of the twelve.
- `question` lets the model stop and ask the user something mid-task.
- `skill` loads extra instructions on demand; denying it also drops the list of skills from the system prompt.

That leaves six tools, `read`, `edit`, `write`, `shell`, `glob` and `grep`, and the first request drops to 2,354 tokens, about 15 s. A session that needs a removed tool can allow it back, at the cost of its definition on every request.

## Results on a two-file task

The project is two Python files: a function with an off-by-one divisor and a test for it. The first-request sizes are the same for any task. The run times hold only for this small one, not for harder work. opencode also sends one short request per run to title the session, and the request counts include it.

| Setup | First request | Test passed | Time per run | Requests per run |
|---|---|---|---|---|
| opencode 2, default | 5,538 tokens, about 35 s | 5/5 | 207 to 335 s | 6 to 8, title included |
| opencode 2, six tools | 2,354 tokens, about 15 s | 5/5 | 109 to 124 s | 6, title included |
| Pi 1.2 (from the Pi post) | 1,599 tokens, about 10 s | 5/5 | 83 to 86 s | 6, no title request |

Each step rereads almost the same prompt, so the time per run follows the size of the first request. The six-tool setup took half the time and lost nothing on this task.

A typical run took five steps. The 9B read both files at once, two tool calls in one request, as opencode's instructions encourage. Then came one edit, the test twice (`python`, not found, then `python3`) and a short answer. In its runs Pi read the two files one at a time, so opencode saved a step, but Pi's smaller first request still made it the fastest.

Nine of the ten opencode runs took these five steps. The tenth, a default run, searched with `glob` first and ran the test before the edit as well as after: seven steps and 335 s. The first default run, at 265 s, came right after the model loaded. Its title request took 35 s instead of about 4 s, and the first step, turned away while the title request ran, had to be sent again.

In opencode's interactive terminal UI, the six-tool setup takes the same five steps:

<img src="/images/opencode-2-session.webp" alt="Interactive opencode 2.1.2 session on the toy project with Qwen 3.5 9B on the Enigmus LLM Server: the prompt says test_calc.py fails, the model reads test_calc.py and calc.py in one step, edits the divisor from len(xs) + 1 to len(xs), gets command not found for python, runs python3 test_calc.py which prints ok, and answers that the test now passes; the footer reads qwen35-9b Enigmus" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

On the Enigmus side, the LLM Server screen logs the same run. The title request returns in 4 s, and each step takes 17 to 22 s, most of it spent reading the prompt. The model also thinks before every step, shown as "Thought" in opencode and `think` in the log. The server turns thinking on for every request that carries tools, since that is how its tool calling was tested, so opencode's own thinking setting has no effect here.

<img src="/images/opencode-2-server-log.webp" alt="Logs section of the Enigmus LLM Server screen on macOS after the interactive opencode run: the title request returns 9 tokens in 4.1 s, requests 2 to 5 return tool calls in 16.6 to 20.5 s each, and request 6 returns the 109-token answer in 22.3 s" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

## Compaction inside a 32K context

opencode keeps a long session's prompt small by compacting it: it summarizes the conversation and carries on from the summary. When it does that depends on the model's context length. opencode 2 reads that length from Ollama, LM Studio and vLLM by itself. Enigmus is added as a plain OpenAI-compatible provider, so opencode knows nothing of its model's length. It then assumes 200,000 tokens and keeps 15% of that free, which puts compaction at roughly 170,000. At 160 tokens per second, a request that size would take about 18 minutes to read.

The `limit` block in the config below sets a 32,768-token context and an 8,192-token reply. Without the reply cap, opencode asks for 32,000 reply tokens on every request, and the server reserves memory for the whole cap before it starts. 32K is a choice for speed and memory on a 16 GB Mac, not the model's 256K limit; a Mac with more memory can go higher, at the cost of longer reads. In a session that read five Swift files of 15 to 20 KB, one per request:

- **Trigger:** about 16,800 tokens (32,768 minus 16,000, the minimum opencode keeps free for the next reply and the summary)
- **Last request before compacting:** 14,319 tokens, with two files read, and reading the third took the conversation past the trigger
- **Summary request:** 4,537 tokens, with each file's text cut short
- **First request after it:** 2,820 tokens
- **Whole session:** 408 s, one compaction

The summary was short: the task, which files were done and which were left, and a few words on each file read so far. That was enough to finish: the model read the last two files and wrote a line on each of the five, though for the first three it had only those few words to go on.

## Setup

**1. Turn on the server** in Enigmus, as in the [Pi post](/posts/pi-coding-agent-on-enigmus): the LLM Server row at the top of the sidebar, then Active. It serves the loaded model at `http://127.0.0.1:31415/v1`. Load Qwen 3.5 9B first: the config below names it, and the server turns away requests for any model that is not loaded.

**2. Install opencode 2.** Version 2 is the `@opencode/cli` npm package, and Homebrew's `opencode` formula is version 2 as well. The older `opencode-ai` npm package is 1.x and installs the same `opencode` command, so opencode's [migration guide](https://opencode.ai/v2/docs/migrate-v1) says to remove it first:

```bash
npm rm -g opencode-ai
npm i -g @opencode/cli
```

**3. Add Enigmus as a provider** in `~/.config/opencode/opencode.json`. The server has no API key, and opencode needs none here:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "enigmus/qwen35-9b",
  "providers": {
    "enigmus": {
      "name": "Enigmus",
      "package": "@opencode/ai/providers/openai-compatible",
      "settings": { "baseURL": "http://127.0.0.1:31415/v1" },
      "models": {
        "qwen35-9b": {
          "modelID": "mlx-community/Qwen3.5-9B-4bit",
          "capabilities": { "tools": true, "input": ["text"], "output": ["text"] },
          "limit": { "context": 32768, "output": 8192 }
        }
      }
    }
  },
  "policies": [
    { "action": "provider.use", "resource": "*", "effect": "deny" },
    { "action": "provider.use", "resource": "enigmus", "effect": "allow" }
  ],
  "permissions": [
    { "action": "execute", "resource": "*", "effect": "deny" },
    { "action": "websearch", "resource": "*", "effect": "deny" },
    { "action": "webfetch", "resource": "*", "effect": "deny" },
    { "action": "subagent", "resource": "*", "effect": "deny" },
    { "action": "question", "resource": "*", "effect": "deny" },
    { "action": "skill", "resource": "*", "effect": "deny" }
  ]
}
```

Leaving out `permissions` keeps the default twelve tools. The `policies` are covered under [What leaves the Mac](#what-leaves-the-mac).

**4. Run it.** `opencode run` works through one prompt and prints the result, and plain `opencode` opens the interactive terminal UI:

```bash
OPENCODE_DISABLE_MODELS_FETCH=1 opencode run --standalone --auto --title "calc test" \
  "test_calc.py fails. Fix the bug in calc.py and run the test."

OPENCODE_DISABLE_MODELS_FETCH=1 OPENCODE_DISABLE_AUTOUPDATE=1 opencode --standalone --auto
```

`--auto` approves tool calls that no rule denies, so the model runs shell commands without asking. A throwaway checkout is the place to try it. `--standalone` runs opencode in its own process instead of the shared background service it otherwise starts, and the two variables turn off its model catalog download and update check; [What leaves the Mac](#what-leaves-the-mac) shows why. `--title` names the session up front, so opencode skips the title request it would otherwise send alongside the first prompt. Enigmus runs one generation at a time, so that request holds up the first step: about 4 s, more on the first run after the model loads.

## What leaves the Mac

The model calls stay on the Mac, at 127.0.0.1. Watched with `nettop` and `lsof`, a short `opencode run --standalone` made one other connection: opencode downloads its model catalog, about 430 KB, from models.opencode.ai. `OPENCODE_DISABLE_MODELS_FETCH=1` skips it, and the run then reached nothing beyond 127.0.0.1. The interactive terminal UI also checks opencode.ai for updates, at startup and every 10 minutes. `OPENCODE_DISABLE_AUTOUPDATE=1` turns that off, and with both variables set, a terminal UI session also stayed on 127.0.0.1. The six-tool setup also removes opencode's web tools: web search, web fetch and the `fetch` that Code Mode provides. `shell` can still reach the network.

The two `provider.use` [policies](https://opencode.ai/v2/docs/policies) make Enigmus the only provider opencode 2 will use. When opencode cannot use the configured model, it falls back to another one; without the policies, that is one of its own free hosted models. Each row is the model it picked for `opencode run --standalone "Say hi."`:

| Config | Model opencode picked |
|---|---|
| No config file | Big Pickle, hosted |
| Enigmus provider, `model` mistyped, no policies | minimax-m3.1-flash-free, hosted |
| The same, with the two policies | qwen35-9b on Enigmus, the one provider allowed |

The policies only work if opencode finds the config, so it is worth checking that opencode shows `qwen35-9b` as the model, as in the footer of the session screenshot above. On a hosted model, the prompt and every file the agent reads leave the Mac, and opencode's [model docs](https://opencode.ai/v2/docs/console/models) say data collected during Big Pickle's free period may be used to improve the model.

Without `--standalone`, opencode 2 starts a [shared background service](https://opencode.ai/v2/docs/cli) that its terminal, desktop and web apps all connect to. That service keeps running after the command, re-fetches the model catalog every 5 minutes, and only honors `OPENCODE_DISABLE_MODELS_FETCH` if it was started with it.

## Getting it

With the six-tool setup, opencode 2 and Qwen 3.5 9B finished the two-file task in about two minutes on a 16 GB M1 Pro, with every model call served on the Mac. The LLM Server ships in Enigmus 1.3 for Mac on the [Mac App Store](https://apps.apple.com/us/app/enigmus/id6771532268?platform=mac), and Qwen 3.5 9B, the only model tested here, downloads from the model list in the app. opencode is free and open source at [opencode.ai](https://opencode.ai).
