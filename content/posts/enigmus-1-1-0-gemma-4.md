---
title: "Enigmus 1.1.0: Gemma 4 on-device, and a compact text-only checkpoint"
date: 2026-07-15T00:00:00Z
image: /images/gemma4-catalogue-cover.webp
image_alt: "Enigmus model installer showing the Gemma 4 model catalogue on iPhone"
hero_iphone: /images/gemma4-catalogue
hero_iphone_height: 2609
categories: ["AI", "privacy"]
featured: true
draft: false
---

Enigmus 1.1.0 adds Google's Gemma 4 to the model picker across iPhone, iPad, and Mac. As with everything in the app, the new models run locally: the prompt, the generated tokens, and the chat history stay on the device, and the only network request is the one-time weight download. This post covers what changed under the hood — the runtime the models load into, the full Gemma 4 lineup now available, a compact text-only E2B checkpoint that needed a small configuration fix to run correctly, and three smaller refinements to rendering and downloads.

## The runtime: MLX and mlx-swift-lm

Inference runs on Apple's [MLX](https://github.com/ml-explore/mlx) array framework, which executes the model on the Apple silicon GPU through Metal against the unified memory pool shared with the CPU. Because CPU and GPU address the same memory, weights are not copied across a bus at load time, and the practical ceiling on model size and context length is simply the machine's RAM.

The model layer above MLX is [mlx-swift-lm](https://github.com/ml-explore/mlx-swift-lm), the Swift port of `mlx-lm`. It owns the model registry that maps a checkpoint's `model_type` string to a concrete architecture, decodes each repository's `config.json` into a typed configuration, loads the safetensors weights, and drives the token-generation loop. Enigmus pins this stack — mlx-swift `0.31.4` and mlx-swift-lm `3.31.4` — so that every shipped model is validated against exact revisions rather than a moving dependency. Adding Gemma 4 to the catalog was possible without a dependency bump: mlx-swift-lm `3.31.4` already registers the `gemma4` and `gemma4_text` model types.

## The Gemma 4 family in the picker

Gemma 4 now spans the full size range in the installer — E2B, E4B, 12B, 26B, and 31B, as OptiQ 4-bit builds, with native context windows of 128K–256K tokens. These are the standard multimodal `gemma4` checkpoints; the Swift port constructs only the causal-language-model decoder and does not load a vision tower, so they run as ordinary text models.

Model selection remains bounded by memory. The installer reads available RAM and free storage, lists each build with its on-disk size, marks the largest that fits as recommended, and disables anything that would exceed the memory or storage budget. A phone is pointed at an E2B or E4B build; a Mac with large unified memory can run the 26B or 31B builds. Weights are fetched from Hugging Face's CDN, the only optional network request in the app.

## A compact text-only E2B checkpoint

Alongside the standard OptiQ builds, 1.1.0 ships a smaller-footprint E2B option: `Gemma4-E2B-IT-Text-int4`, a natively text-only checkpoint quantized to affine 4-bit at group size 64. It is a ~2.7 GB download against roughly 5.2 GB for the standard E2B build — a meaningful saving on devices where the larger 4-bit weights do not fit. It is offered as the recommended model precisely in that gap: where ~2.7 GB fits but 4.0 GB does not.

Getting this checkpoint to run correctly required a configuration fix worth describing, because it is a good illustration of how quietly a positional-encoding bug can degrade output. Gemma 4's text decoder uses a partial rotary embedding: on its full-attention layers, only a fraction of each head's dimensions are rotated. The correct `partial_rotary_factor` is `0.25`, so on the E2B's full-attention layers (7 of 35, with a 512-dimension global head) exactly 128 dimensions rotate.

This checkpoint declares its rope parameters *nested* under a `text_config` key. The pinned `gemma4_text` decoder reads rope parameters only from the top level of the config, and when it finds none it falls back to a default `partial_rotary_factor` of `1.0` — rotating all 512 dimensions. Every other shape field's default happened to match the real model, so the checkpoint loaded and produced fluent, coherent text. The damage was invisible at a glance and only surfaced on long-range retrieval: positional error under rotary embeddings grows with token distance, so short replies looked fine while facts that depended on attending across a long context drifted or dropped out.

Enigmus corrects this at download time with a small, idempotent config shim: for a `gemma4_text` checkpoint that has a nested `text_config.rope_parameters` but no top-level copy, it hoists those values verbatim to the top level before the model is loaded. The shim duplicates rather than overrides, so it resolves to the same correct model under the current decoder, under a future upstream fix to the default, and under a future decoder that reads the nested form directly — and it no-ops on any checkpoint that is already published with a flat config. A slow test loads the same weights twice, as published and with the values hoisted, and asserts the corrected build recalls a fact planted ~2,000 tokens back, outside the sliding-attention window, where only the full-attention layers can retrieve it.

One honest note on positioning: even with the rope fix, this post-training-quantized text checkpoint trades some knowledge recall against the quantization-aware-trained OptiQ builds. Side-by-side, the standard E2B build recalls specific named entities more reliably on hard prompts. The text-only checkpoint is therefore offered as the compact option for tighter memory, not as the quality pick — the standard OptiQ builds remain the default wherever they fit.

## Rendering: typeset math

Equations now render as typeset math rather than raw LaTeX source — both inline and in display blocks, and progressively as a reply streams in, including math inside markdown tables and headings. For models that produce step-by-step derivations this makes the output legible as it arrives rather than after the fact.

## Copying replies

Each assistant response now has a copy button that copies the raw markdown, with code blocks and equations preserved as source rather than as rendered output — so a code snippet pastes as code and an equation pastes as LaTeX.

## Faster, resumable downloads

Model downloads are faster and more reliable, and a paused or interrupted download can now be cleared with a "delete partial" action, which removes the incomplete weights and frees the storage rather than leaving a stalled transfer occupying disk.

## Getting it

Enigmus 1.1.0 is a free update for the existing app on iPhone (13 or newer), iPad (M1 or newer), and Mac (Apple silicon). The inference engine is identical across all three; the difference is only how much memory each has to spend on a model.

[Enigmus on the App Store](https://apps.apple.com/us/app/enigmus/id6771532268)
