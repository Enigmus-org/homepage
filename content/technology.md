---
title: Technology for Private AI on Apple Devices
description: "Enigmus delivers private, on-device AI for Mac, iPhone, and iPad using Apple's MLX framework. By leveraging Apple Silicon's unified memory architecture and Metal GPU acceleration, all processing happens locally—data never leaves the device."
layout: aurora-article
heading: Private AI, Powered by
heading_accent: Apple Silicon
intro: Enigmus is built exclusively for Apple platforms, leveraging MLX—Apple's machine learning framework—to deliver private AI on Mac, iPhone, and iPad. By running entirely on-device, data never leaves the hardware.
---

## Why Apple Silicon?

LLM inference is memory-bound: generating each token requires streaming the model's weights through the processor, so memory capacity and bandwidth matter more than raw compute. Apple's M-series chips (M1 through M5) are unusually well suited to this workload because of their **unified memory architecture**—CPU, GPU, and Neural Engine share one high-bandwidth memory pool, so tensors never cross a PCIe bus and there is no separate VRAM ceiling.

This means large language models run efficiently without a dedicated GPU: the same memory that holds the OS and apps holds the model. A MacBook, iMac, or iPhone becomes a capable AI workstation.

## MLX: Apple's ML Framework

MLX is Apple's open-source array framework for machine learning, purpose-built for Apple Silicon. It pairs a NumPy-like API with **lazy evaluation**—computation graphs are built up and executed only when results are needed—and dispatches work to Metal kernels tuned for Apple GPUs. At WWDC 2025, Apple signaled MLX as a strategic component of their AI ecosystem, with deep integration into macOS and iOS.

### Key Advantages

- **Unified Memory**: Arrays live in shared memory—operations run on CPU, GPU, or Neural Engine without data copying
- **Metal GPU Acceleration**: Hand-tuned Metal kernels for the operations that dominate transformer inference—attention, matrix multiplication, and quantized arithmetic
- **Native Swift Support**: The mlx-swift bindings expose the same runtime to iOS and macOS apps—this is what Enigmus builds on
- **Neural Engine Integration**: On M5 chips, MLX leverages dedicated Neural Accelerators for matrix operations

### On-Device Benefits

Running AI locally on Apple devices provides:

- **Complete Privacy**: Conversations and data never leave the device
- **No API Costs**: No per-token fees or subscription requirements
- **Offline Capable**: Works without internet once the model is downloaded
- **Low Latency**: Instant responses without network round-trips

## Supported Models

Enigmus runs open-weight models quantized to 4-bit precision, which puts memory use at roughly half a gigabyte per billion parameters plus overhead for the KV cache—the practical rule of thumb for what fits on a given device. Supported model families are optimized for Apple Silicon:

### Gemma 4 by Google

Google's open-weight family, released March 2026 under the Apache 2.0 license:

- **Gemma 4 E2B / E4B**: "effective-parameter" models that use Per-Layer Embeddings for efficiency—built for edge deployment, ideal for iPhone and iPad
- **Gemma 4 12B**: dense multimodal model with an encoder-free architecture—about 6GB of weights at 4-bit, fits comfortably in 16GB of unified memory
- **Gemma 4 26B A4B**: sparse MoE with only 4B parameters active per token—26B-class quality at small-model speed, for 16GB+ Macs
- **Gemma 4 31B**: the dense flagship—roughly 16GB of weights at 4-bit, a natural fit for Macs with 32GB+ unified memory

Gemma 4 is multimodal (text and image input), supports a 256K-token context window, and covers 140+ languages.

### GPT-OSS by OpenAI

OpenAI's first open-weight models since GPT-2, released August 2025:

- **gpt-oss-20b**: 21B parameters, runs within 16GB memory—ideal for M1/M2/M3 Macs
- **gpt-oss-120b**: 117B parameters for high-memory configurations

Both use mixture-of-experts (MoE) architecture with 4-bit quantization, delivering excellent performance on Apple Silicon.

### Qwen3 by Alibaba

Alibaba's hybrid reasoning models, released April 2025:

- **Qwen3-0.6B / Qwen3-1.7B / Qwen3-4B / Qwen3-8B**: Models for iPhone and iPad, with Qwen3-8B for high-memory devices
- **Qwen3-14B / Qwen3-32B**: Full-featured models for Mac
- **Qwen3-30B-A3B**: Sparse MoE variant—32B-class performance with only 3B parameters active
- **Qwen3-Next-80B / Qwen3-235B-A22B**: Large models for high-memory Macs (64GB+)

Qwen3 features hybrid reasoning (toggle between fast and deep thinking), 128K context window, and support for 119 languages.

## Fully Offline After Model Download

A default model ships inside the app bundle, so Enigmus works offline from first launch. Additional models are fetched once—static weight files from the public Hugging Face MLX Community repositories—and stored locally. From that point no network connection is required: tokenization, inference, and decoding all run in-process, and nothing in the pipeline has a server to call.

Airplane mode is a valid operating environment—chats behave identically with networking disabled. The only network activity Enigmus initiates is a model download, and only when one is explicitly requested.

## Performance on Apple Devices

The binding constraint is unified memory: the quantized weights plus the KV cache—which grows with context length—must fit alongside the OS and other apps. Token throughput then scales primarily with memory bandwidth.

### Mac (Apple Silicon)

On M1 and newer Macs, Enigmus delivers responsive AI interactions:

- **M1/M2 (8GB)**: Qwen3-0.6B and Qwen3-1.7B run smoothly for everyday tasks
- **M1/M2 Pro (16GB+)**: GPT-OSS-20b and Qwen3-14B for advanced use cases
- **M3/M4 Max (64GB+)**: Run large models including Qwen3-32B, Qwen3-Next-80B
- **M3/M4 Max (128GB+)**: Run the largest models including Qwen3-235B-A22B
- **M5 with Neural Accelerators**: Optimized matrix operations for fastest inference

### iPhone & iPad (iOS 18+)

Enigmus brings on-device AI to mobile:

- **iPhone 13+ / iPad**: Run Qwen3-0.6B, Qwen3-1.7B, Qwen3-4B, or Qwen3-8B (high-memory devices)
- **Increased Memory Entitlement**: Enables larger models on capable devices
- **Metal GPU Required**: Real device needed (simulators not supported)

## The Privacy Advantage

Unlike cloud-based AI services, Enigmus processes everything locally. When asking a question, drafting an email, or analyzing a document:

1. The prompt is tokenized in the app's own memory
2. The model executes on Apple Silicon via Metal—no server round-trip
3. Tokens are generated and decoded locally, straight into the interface
4. Nothing is uploaded—there is no server endpoint to receive it

This architecture ensures privacy by design—data remains on the device at all times. The [AI and privacy page](/ai-and-privacy) covers why that matters.

---

## Frequently Asked Questions

<details>
<summary><strong>What is MLX and why does Enigmus use it?</strong></summary>

MLX is Apple's open-source machine learning framework, designed specifically for Apple Silicon. Unlike other ML frameworks, MLX uses a **unified memory model** where arrays live in shared memory—allowing operations to run on CPU, GPU, or Neural Engine without copying data between them. This makes it exceptionally efficient for running large language models on Mac, iPhone, and iPad.

At WWDC 2025, Apple announced deeper MLX integration into macOS and iOS, signaling it as a core component of their AI strategy.

*Sources: [Apple MLX Open Source](https://opensource.apple.com/projects/mlx/) · [GitHub - ml-explore/mlx](https://github.com/ml-explore/mlx) · [WWDC 2025 MLX Session](https://developer.apple.com/videos/play/wwdc2025/298/)*

</details>

<details>
<summary><strong>What's the minimum Mac configuration to run Enigmus?</strong></summary>

Enigmus requires **any Mac with Apple Silicon** (M1 or newer) running **macOS 14 Sonoma** or later. The experience scales with the hardware:

- **8GB RAM**: Compact models like Gemma 4 E4B or Qwen3-1.7B for everyday tasks
- **16GB RAM**: Gemma 4 12B or the 26B A4B MoE, plus mid-size models like GPT-OSS-20b
- **32GB+ RAM**: Gemma 4 31B with room for long contexts
- **64GB+ RAM**: Large models like Qwen3-32B, Qwen3-Next-80B
- **128GB+ RAM**: The largest models like Qwen3-235B-A22B

The M5 chips with Neural Accelerators provide the fastest inference thanks to dedicated matrix multiplication hardware.

*Sources: [MLX Documentation](https://ml-explore.github.io/mlx/build/html/index.html) · [Apple M5 Neural Accelerators](https://machinelearning.apple.com/research/exploring-llms-mlx-m5)*

</details>

<details>
<summary><strong>Does Enigmus run on iPhone and iPad?</strong></summary>

Yes. Enigmus supports **iOS 18+** on devices with sufficient hardware:

- **iPhone 13** or newer (A15 chip or later)
- **iPad** with A15 chip or later

A real device is required—iOS Simulators don't support the Metal GPU features MLX requires. For larger models, the "Increased Memory Limit" entitlement must be enabled in device settings.

The Gemma 4 E2B and E4B models are built specifically for this class of device—Per-Layer Embeddings keep their memory footprint small—and Qwen3-0.6B through Qwen3-4B run well too, with larger options on high-memory devices.

*Sources: [MLX Swift on iOS](https://medium.com/@cetinibrahim/mlx-swift-run-llms-in-ios-apps-8f89c1123588) · [GitHub - ml-explore/mlx-swift](https://github.com/ml-explore/mlx-swift)*

</details>

<details>
<summary><strong>What is Gemma 4 and why is it good for local AI?</strong></summary>

Gemma 4 is Google's **open-weight model family**, released in March 2026 under the Apache 2.0 license. The family spans five members: the edge-focused **E2B** and **E4B** effective-parameter models, the dense multimodal **12B**, the sparse **26B A4B** mixture-of-experts, and the dense **31B** flagship.

For local deployment it brings several advantages:

- **Multimodal**: Text and image input (audio on the small models), with the 12B using a unified, encoder-free architecture
- **Massive context**: Up to a 256K-token context window
- **Efficiency by design**: Per-Layer Embeddings on the small models and only 4B active parameters on the 26B A4B
- **Multilingual**: Over 140 languages

*Sources: [Gemma 4 announcement | Google](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/) · [Gemma 4 model overview](https://ai.google.dev/gemma/docs/core) · [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4)*

</details>

<details>
<summary><strong>Which Gemma 4 variant fits which device?</strong></summary>

At 4-bit quantization, memory use is roughly half a gigabyte per billion parameters plus the KV cache:

- **E2B / E4B**: iPhone 13+ and iPad—Per-Layer Embeddings keep the working set small
- **12B**: ~6GB of weights—comfortable in 16GB of unified memory
- **26B A4B**: ~13GB of weights but only 4B parameters active per token—16GB+ Macs with small-model speed
- **31B**: ~16GB of weights—best on Macs with 32GB+ unified memory

*Sources: [Gemma 4 12B developer guide](https://developers.googleblog.com/gemma-4-12b-the-developer-guide/) · [google/gemma-4-12B on Hugging Face](https://huggingface.co/google/gemma-4-12B)*

</details>

<details>
<summary><strong>What other models does Enigmus support?</strong></summary>

Beyond Gemma 4, Enigmus runs OpenAI's **GPT-OSS** family (gpt-oss-20b fits in 16GB; the 117B gpt-oss-120b suits high-memory Macs), both MoE models quantized in MXFP4, and Alibaba's **Qwen3** family—from the 0.6B ultra-light for iPhone up to Qwen3-235B-A22B for 128GB Macs, with hybrid fast/deep reasoning and a 128K context window.

*Sources: [Introducing GPT-OSS | OpenAI](https://openai.com/index/introducing-gpt-oss/) · [GitHub - QwenLM/Qwen3](https://github.com/QwenLM/Qwen3)*

</details>

<details>
<summary><strong>Does data stay private with Enigmus?</strong></summary>

**Yes, completely.** Enigmus processes everything on-device using Apple's MLX framework. Here's what that means:

1. **No cloud connection required**: Once a model is downloaded, Enigmus works entirely offline
2. **No data transmission**: Prompts, documents, and conversations never leave the Mac, iPhone, or iPad
3. **No telemetry**: No usage data, analytics, or interaction information is collected
4. **Local ownership**: Everything stays in local storage under user control

This is fundamentally different from cloud AI services like ChatGPT or Claude, which process data on remote servers. With Enigmus, privacy isn't a policy—it's architecture.

*Sources: [MLX Unified Memory Model](https://ml-explore.github.io/mlx/build/html/unified_memory.html) · [On-device ML with MLX Swift](https://www.swift.org/blog/mlx-swift/)*

</details>
