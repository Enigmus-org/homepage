---
title: "Enigmus 1.0 on the Mac: local LLMs on Apple silicon"
date: 2026-06-25T00:00:00Z
image: /images/launch-mac-hero.webp
categories: ["AI", "privacy"]
featured: true
draft: false
---

Enigmus 1.0 is now on the Mac App Store, alongside the iPhone and iPad build. The architecture is identical: language models run locally, and the prompt, the generated tokens, and the chat history stay on the machine. There is no account and no backend. Network access happens only while a model is being downloaded; inference itself runs with the machine offline.

Inference uses Apple's [MLX](https://github.com/ml-explore/mlx) framework, which runs the model on the Apple silicon GPU through Metal against the unified memory pool shared with the CPU. The models are 4-bit quantized builds of the open-weight Qwen3 family. A Mac's larger unified memory raises the ceiling on both model size and context length compared to a phone. A small model is bundled in the app, so the first message works before any download. The sections below cover what the Mac build does, one screen at a time.

## Local by default

The onboarding screen documents the runtime model up front rather than in a settings pane: conversations are stored on-device, there are no accounts, servers, or telemetry, and the weights are publicly released rather than a proprietary endpoint. These are properties of the design, not switches — with no outbound traffic during inference, there is no server-side log or profile to produce.

<img src="/images/launch-mac-welcome.webp" alt="Enigmus welcome window on macOS listing three principles: private, local only, open weights" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

## A desktop window, with history in the sidebar

On macOS the app is a standard window. Conversation history is held in a local SwiftData store and listed in a searchable sidebar; the active conversation fills the main pane, with keyboard and pointer input. Generation streams token by token from the local model, so throughput is bounded by the GPU rather than a network round-trip, and it proceeds with networking disabled. Output is rendered as markdown — headings, lists, and syntax-highlighted code blocks — and LaTeX is typeset rather than left as source; the screenshot below shows the model deriving Euler's formula with both inline and display equations. Reasoning-tuned models (Qwen3 4B and larger) emit a separate thinking trace, shown in a collapsible block ahead of the final answer.

<img src="/images/launch-mac-chat.webp" alt="Enigmus on macOS showing a conversation-history sidebar and a chat rendering Euler's formula with typeset equations" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

## Memory governs model selection

Both feasibility and throughput are bounded by memory, so the installer is built around the machine's limits. It reads the available RAM and free storage, lists each model with its on-disk size, marks the largest build that fits the memory budget as recommended, and disables the ones that exceed available RAM or storage. In the screenshot, a 24 GB machine is pointed at an 8B 4-bit build and a 14B build is disabled for insufficient free storage. The catalog spans the bundled model through larger Qwen3 variants, including reasoning-tuned builds. Weights are fetched from Hugging Face's CDN, the only optional network request in the app.

<img src="/images/launch-mac-models.webp" alt="Model installer on macOS showing available RAM and free storage, a list of Qwen3 models with sizes, a recommendation, and a disabled model" style={{maxWidth: '720px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '8px'}} />

## Getting it

The Mac build targets Apple silicon (M1 or newer) and runs the same inference engine as the iPhone and iPad release. It is free, with no account.

[Download Enigmus on the Mac App Store](https://apps.apple.com/us/app/enigmus/id6771532268?platform=mac)
