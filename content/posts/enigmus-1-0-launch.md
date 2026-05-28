---
title: "Enigmus 1.0: local LLMs on iPhone and iPad"
date: 2026-05-28T00:00:00Z
image: /images/launch-hero.webp
categories: ["AI", "privacy"]
featured: true
draft: false
---

Enigmus 1.0 is out on the App Store for iPhone and iPad. It runs large language models entirely on the device — the prompt, the generated tokens, and the chat history never leave the hardware. There is no account to create and no server to talk to. The only time the app touches the network is when a new model is downloaded; after that, it works in airplane mode.

Inference runs on Apple's [MLX](https://github.com/ml-explore/mlx) framework, which executes on the Apple silicon GPU and the unified memory shared with the CPU. The models are 4-bit quantized builds of the open-weight Qwen3 family, which keeps memory use low enough that a phone can hold a useful model resident and still leave room for the rest of the system. A small model ships inside the app, so there is something to talk to within seconds of the first launch — no download gate before the first message. The sections below walk through what 1.0 actually does, one screen at a time.

## Local by default

The first launch states the constraints up front rather than burying them in a settings screen: conversations stay on the device, there are no accounts or servers or telemetry, and the models are publicly released open weights rather than a proprietary endpoint. These aren't toggles that can be switched off later — they're a consequence of the architecture. With nothing leaving the device, there is no log to leak and no profile to build.

<img src="/images/launch-privacy.webp" alt="Enigmus onboarding screen listing three principles: private, local only, open weights" style={{maxWidth: '300px', width: '100%', display: 'block', margin: '0 auto'}} />

## A chat that works with the radios off

The chat itself is a normal multi-turn conversation — ask a question, follow up, change direction — except that each reply is generated locally and streams in token by token as the model produces it. Because nothing is round-tripping to a data center, the latency is whatever the device's GPU can manage, and it keeps working with Wi-Fi and cellular fully disabled. Past conversations are kept in a local SwiftData store, so history persists between sessions without ever being synced anywhere.

<img src="/images/launch-chat.webp" alt="A multi-turn chat in Enigmus continuing a short story" style={{maxWidth: '300px', width: '100%', display: 'block', margin: '0 auto'}} />

## Picking a model the device can actually run

On-device inference lives or dies by memory, so the model installer is built around it. It reads the available RAM and pairs each model in the list with its on-disk size, marks the largest one that comfortably fits as recommended, and greys out the ones that would not — a 30B model is simply unavailable on a phone that can't hold it. The catalog ranges from the tiny bundled model up through larger Qwen3 variants pulled from Hugging Face, including reasoning-tuned builds. Downloads come from Hugging Face's public CDN, the one piece of optional network traffic in the app.

<img src="/images/launch-models.webp" alt="Model installer showing available RAM and a list of Qwen3 models with sizes and a recommendation" style={{maxWidth: '300px', width: '100%', display: 'block', margin: '0 auto'}} />

## Measuring before committing

Different models trade quality for speed and memory in ways that depend on the specific device, so 1.0 includes a benchmark that runs a model and reports the numbers that matter: load time, the memory the model occupies versus what the system has, and throughput split into prompt processing and generation-only tokens per second. It's a quick way to find out whether a given model is fast enough to be pleasant on a particular iPhone or iPad before settling on it for daily use.

<img src="/images/launch-benchmark.webp" alt="Benchmark results showing load time, model memory, total memory, and tokens per second" style={{maxWidth: '300px', width: '100%', display: 'block', margin: '0 auto'}} />

## Markdown, code, and real math

Replies render as formatted markdown rather than a wall of plain text — headings, lists, and syntax-highlighted code blocks — and LaTeX is typeset properly instead of being left as raw `\(` source. The screenshot below is the model working through Euler's formula, with both inline expressions and display equations laid out as actual math. Reasoning-capable models (Qwen3 4B and up) also show their thinking in a collapsible section before the final answer, which makes it easier to see how a conclusion was reached.

<img src="/images/launch-math.webp" alt="Enigmus rendering Euler's formula with typeset inline and display equations" style={{maxWidth: '300px', width: '100%', display: 'block', margin: '0 auto'}} />

## Dark mode and bigger screens

Enigmus follows the system appearance, so the same conversation reflows into a dark theme without any fiddling. The layout also adapts beyond the phone: on iPad and Mac it spreads into a wider arrangement with keyboard and pointer support, and a handful of cosmetic settings — tint color, fonts, and haptics — are there for anyone who wants to adjust them.

<img src="/images/launch-dark-mode.webp" alt="The same Enigmus chat shown in dark mode" style={{maxWidth: '300px', width: '100%', display: 'block', margin: '0 auto'}} />

## Getting it

Enigmus 1.0 requires an iPhone 13 or newer (A15 Bionic or later) or an iPad with an M1 chip or newer. The Mac build is close behind. It's free, with no account.

[Download Enigmus on the App Store](https://apps.apple.com/us/app/enigmus/id6771532268)
