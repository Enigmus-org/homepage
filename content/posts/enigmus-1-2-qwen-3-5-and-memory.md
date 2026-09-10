---
title: "Enigmus 1.2: Qwen 3.5 and 3.6, and memory handling improvements"
date: 2026-09-10T12:00:00Z
image: /images/enigmus-1-2-cover.webp
image_alt: "The Enigmus chat screen on iPhone: a multi-turn conversation about Jungian archetypes, with the two-row input bar underneath holding the model picker and the thinking toggle"
hero_iphone: /images/enigmus-1-2-input-bar
hero_iphone_height: 2608
categories: ["AI", "MLX"]
featured: true
draft: false
---

Enigmus runs open-weight language models entirely on device, on iPhone, iPad and Mac, with MLX Swift doing the inference. There is no account, and no network traffic once a model has been downloaded. Version 1.2 shipped as three point releases, 1.2.0 through 1.2.2. This post covers the part worth writing down.

Seven changes, roughly ordered by how much they alter the app's behavior. Two are about which models run, three are about memory, two are about the chat screen. The memory ones are the least visible and took the most work.

## 1. The Qwen rows moved to 3.5 and 3.6

<IPadFrame
  src="/images/enigmus-1-2-install-list"
  alt="The model installer on an iPad with 12 GB of RAM and 7.5 GB free, sorted smallest first: Qwen 3.5 at 2B, 4B and 9B interleaved with Gemma 4 rows tagged MoE and their active parameter count, and Qwen 3.6 27B and 35B-A3B greyed out as not enough RAM"
  dark={false}
  className="relative mx-auto mb-10 mt-2 w-[300px] md:w-[420px]"
/>

The main list is now current-generation Qwen: 3.5 at 2B, 4B, 9B and 122B-A10B, and 3.6 at 27B and 35B-A3B, since 3.6 ships only those two sizes. That spans 1.7 GB to 69.6 GB of 4-bit weights, all with 256K context windows. The Qwen3 line moved to a legacy sub-menu, where the two smallest rows stay installable. The rest was removed.

This cost no dependency bump, which was the pleasant surprise. The pinned `mlx-swift-lm` 3.31.4 already registers `qwen3_5`, `qwen3_5_moe` and `qwen3_5_text`, and Qwen 3.6 reuses the 3.5 architecture outright: the `config.json` in `Qwen3.6-27B-4bit` declares `"model_type": "qwen3_5"`. Both generations load on the same stack.

There was exactly one real code change, and it was not in the loader. Qwen 3.5 and 3.6 ignore the `/no_think` suffix that Qwen3 understood. They gate reasoning on an `enable_thinking` chat-template argument instead, and default it to off. That is what forced the toggle work in item 6.

The mixture-of-experts rows carry a tag naming their active parameter count, because the size badge alone mis-sells them: decode cost tracks active parameters, not resident size. The tag deliberately says nothing about memory, and the RAM gate never reads it.

## 2. The bundled model is now Qwen3.5-0.8B

<IPhoneFrame
  src="/images/enigmus-1-2-benchmark"
  alt="The first-run benchmark screen for the bundled Qwen 3.5 0.8B-4bit model: load time, model memory, total memory, tokens per second, and a three-line generated sample"
  height={2608}
  dark={false}
  sizes="(min-width: 768px) 280px, 240px"
  className="relative mb-10 mt-2 w-[240px] md:w-[280px]"
/>

Every install ships with one model so that first launch works without a network. That used to be Qwen3-0.6B-4bit. It is now Qwen3.5-0.8B-4bit with the vision tower stripped out.

The reason for the swap is a single lineup, not a claim about output. The install list is Qwen 3.5 and 3.6 from top to bottom, so the model inside the app now belongs to the same generation as everything installable from it: the same chat template, the same reasoning switch, the same loader path. Bundling a Qwen3 model would have kept a deprecated family on every first launch, and Qwen3 is the family item 1 moved to a legacy sub-menu. The cost is about 100 MB more in the bundle and 85 MB more resident than the 0.6B it replaced.

The stripping is the interesting part. Qwen3.5's smallest size is 0.8B, every published repo for it is a vision-language checkpoint, and there is no official text-only repack. The loader discards the vision tower during weight sanitization anyway, so bundling the repo as published would put 201 MB of weights into the app that are read once and thrown away. A script removes them ahead of time.

That script's output has to be byte-deterministic, and this is a real constraint rather than tidiness: if the weights differ between builds, every App Store update re-downloads all of them. A Swift mirror of the strip exists so tests can assert against it.

## 3. Memory is decided in one place, and refusals carry numbers

No screenshot for this one, which is the correct outcome. The feature is that nothing happens.

The platform rule the app is built around: on iOS it must never be killed for memory. A jetsam kill is worse than every other failure mode, so an upfront "this will not fit" is preferred over more speed or more context. All of the arithmetic now lives in one type, `MemoryBudget`, which has no MLX dependency and so can be tested without a GPU. On iOS the ceiling is the current footprint plus the kernel's live jetsam headroom from `os_proc_available_memory()`, minus 400 MB of slack. On macOS, where swap exists, it is physical memory minus 3 GB.

The gap that needed closing was prefill. Prefill materializes the whole prompt's KV cache in fp16 in a single burst, inside a synchronous window loop with no callback, no cancellation check and no yield. The decode guard only samples between chunks, so a send with a long history could cross the per-app limit without the guard taking a single sample, and there is no way to abort mid-prefill from application code. The only available fix is to project the burst beforehand and decline.

That check sits between preparing the prompt and building the token iterator, so it runs before prefill and sees the exact prompt length without tokenizing twice. It can decline for two reasons, and both throw before any stream exists: the prompt plus the reply would exceed the context window, or the projected KV cache would push the footprint past the red line.

The reply is reserved up front, not just the prompt. Once the first token is out, a stop can only be reported in-band, after the caller has already been told the request succeeded. Paying for the whole span before starting converts a predictable mid-decode halt into a pre-flight refusal, which is the difference between an answer a caller can act on and a truncated stream it has to interpret. That shape is deliberate: the planned Mac server has to answer clients with a status code, and must never quietly trim a user's context.

Two guards sit behind the admission check, for what it cannot see. The decode loop samples the budget every chunk and stops cleanly at the red line, keeping the partial reply. A kernel memory-pressure handler covers the rest: growth while idle, and pressure caused by other processes.

## 4. Model fit is gated on measured residency, not download size

The install gate needs to know how much RAM a model will actually occupy. It used to estimate that as 0.8 times the download size, a ratio derived from Qwen3.5-2B, where the vision tower happens to be 38.5% of the repo.

The tower is roughly 0.9 GB flat, not a fixed fraction, so the rule under-predicted every row larger than the one it was derived from. Concretely, it put Qwen3.5-9B, which is 5.04 GB of text weights, inside an 8 GB iPhone's 5.0 GB budget. A model that could not run was installable.

Only measured numbers remain: 1.4 GB for the 2B, 4.77 GB for the 9B and 3.98 GB for gemma-4-e2b, all read off devices, plus a 14.09 GB floor taken from the safetensors headers for Qwen3.6-27B, acceptable only because that row is Mac-only. Five Gemma sizes were also simply wrong against their own safetensors headers, understating the storage gate by as much as 4.3 GB. Fixing them reordered two rows, since the list is sorted by size.

A related crash had the same root. Loading a model kept the outgoing one resident until the incoming one had finished, so switching from gemma-4-e2b to Qwen3.5-9B held about 8.7 GiB of weights at once on an 8 GB iPad, and jetsam killed the app in either direction. Loading now releases first, and restores the previous model if the new one fails to load. Separately, the memory readout in Settings was using binary units against a catalog that quotes decimal, so it read about 7% low.

## 5. The KV cache cap is gone

There was a `maxKVSize` setting, defaulting to 8192 tokens, with an override toggle and a slider in Settings.

It did nothing. No model family on the main list ever honored it, because Qwen3.5, Gemma and Qwen3-Next all construct their own caches. The default, the override field threaded through the generation parameters, and the Settings control were dead weight, and the context indicator was reporting the smaller of the cap and the real window, which made it wrong.

All of it came out. Conversations now run to the model's real context window, bounded by memory rather than by a number in a settings screen, and the indicator reports the true figure. The legacy Qwen3 dense rows lost their 8192-token ring-buffer eviction as a consequence, which was accepted: a token cap was only ever a proxy for a memory limit, and after item 3 the memory limit is measured directly.

One detail from the same cleanup. The context label shows a token count with no denominator, on purpose. It used to read as a fraction of the window, but a 262,144-token window reads as endless headroom on a phone that gets killed at a small fraction of it. The number's color tracks distance to the red line instead, which is the limit that actually binds.

## 6. A thinking toggle, derived from catalog metadata

<IPadFrame
  src="/images/enigmus-1-2-thinking-toggle"
  alt="The chat screen on an iPad showing a typeset derivation of Euler's formula, with the input bar underneath: the model chip, the thinking toggle set to fast, and a context counter reading 1,874 tokens"
  dark={false}
  className="relative mx-auto mb-10 mt-2 w-[300px] md:w-[420px]"
/>

Every family expresses reasoning differently. Qwen3 took a `/no_think` suffix. Qwen 3.5 and 3.6 take an `enable_thinking` argument and default it off. Gemma 4 has its own dialect again. So the app needs a per-row notion of what thinking even means before it can show a switch.

The toggle's appearance is a pure function of catalog metadata plus one resolved state bit, with three outcomes. Hidden, when a row has no reasoning to govern. Always-on and disabled, for rows that can only reason, where the disabled chip is what communicates that there is no choice. Live, for hybrid rows, the only case with a real decision in it. Keeping it pure means all three cases are tested without instantiating a view.

The state is per conversation, with an app-wide default as the seed. Both labels name the outcome rather than the mechanism, which is why the off position reads "fast" and not "thinking off". Turning it off is not an absence of thought, it is a quicker answer, and the vocabulary stays two words wide.

## 7. Two-row input bar, and fast by default on touch

The bar is two rows now, as in the screenshot at the top: the message field at full width, and the model picker, the thinking toggle and the send button underneath.

The second row never collapses, whether or not the field has text in it. It is the permanent home for the toggle and for the controls the bar is going to grow, and revealing them only once typing starts would hide them at exactly the moment a new user is looking for them. It costs a few points of idle height, which seemed the cheaper mistake.

Nothing in the bar carries decorative fill. The field and the controls sit on the page ground, and what delineates the input area is a single tinted stroke around it. Two elements do take a fill, both the same one: the model chip always, and the thinking toggle only while thinking is on. In the second case the fill is carrying state, not decoration.

The default for that toggle now differs by platform. New conversations start in fast mode on iPhone and iPad, and in thinking mode on the Mac. A phone decodes slowly enough that a reasoning preamble is most of the wait for a first reply, so on touch thinking is one tap away instead of the default. A Mac has the tokens per second to afford it. Only conversations with no preference of their own are affected.

## What is not here

The parts of 1.2 this post skips: reading a reply aloud, a per-reply decode rate, the running context counter, optional sampling overrides, the Mac menu bar work, and a pile of smaller fixes to the install flow and the message field. The changelog in the repository has the full list.

## Getting it

Enigmus 1.2.2 is a free update for the existing app on iPhone (13 or newer), iPad (M1 or newer), and Mac (Apple silicon). The inference engine is identical across all three. The difference is how much memory each has to spend on a model.

[Enigmus on the App Store, for iPhone and iPad](https://apps.apple.com/us/app/enigmus/id6771532268)

[Enigmus on the Mac App Store](https://apps.apple.com/us/app/enigmus/id6771532268?platform=mac)
